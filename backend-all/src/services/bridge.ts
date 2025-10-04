import { ChainId } from '@/gotbit-tools/node/types'
import {
  blockscanInfoRepo,
  BridgeInfo,
  bridgeInfoRepo,
  tokenRepo,
  transactionRepo,
  userTransactionSyncRepo,
} from '@/lib/database'
import { Token } from '@/lib/database/entities/Token'
import { BRIDGEASSISTS } from '@/utils/constant'
import { _getProvider, isEvmAddress, isSolChain } from '@/utils/helpers'
import { anyBridgeAssist } from '@/utils/useContracts'
import { BigNumber, providers } from 'ethers'
import CONFIRMATIONS from '../confirmations.json'
import { Transaction } from '@/lib/database/entities/Transaction'
import EventLogger from '@/lib/logger/index.logger'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import {
  CHAIN_TO_BUFFER,
  getSolanaSendTx,
  SOL_CHAIN_BUFFER,
  SOLANA_PROGRAM_VERSION,
  solanaWorkspace,
} from '@/utils/solana/helpers'
import { BN, Program } from '@coral-xyz/anchor'
import { AssetchainBridgeSolana } from '@/utils/solana/types/assetchain_bridge_solana'
import { ChainType, ITransaction, TransactionContract } from '@/types'
import { isProd } from '@/utils/env-var'
// import { AddTransactionDto } from '@/types'

export class BridgeService {
  async addBridge(
    bridgeAddress: string,
    chainId: string,
    token: Token,
    provider: providers.JsonRpcProvider
  ) {
    const existingBridge = await bridgeInfoRepo.findOne({ bridgeAddress, chainId })
    if (existingBridge) {
      return existingBridge
    }

    const bridge = anyBridgeAssist(bridgeAddress, provider)
    const feeFulfillPromise = bridge.feeFulfill()
    const feeSendPromise = bridge.feeSend()
    const limitPerSendPromise = bridge.limitPerSend()
    const tokenDecimalPromise = token.decimal

    const [feeFulfill, feeSend, limitPerSend, tokenDecimal] = await Promise.all([
      feeFulfillPromise,
      feeSendPromise,
      limitPerSendPromise,
      tokenDecimalPromise,
    ])

    const fees = {
      feeFulfill: +feeFulfill.toString(),
      feeSend: +feeSend.toString(),
    }
    const _limitPerSend = limitPerSend.toString().includes('e+')
      ? BigInt(Math.round(Number(limitPerSend.toString()))).toString()
      : limitPerSend.toString()

    const bridgeInfo = bridgeInfoRepo.create({
      bridgeAddress,
      chainId,
      token,
      fees,
      limitPerSend: _limitPerSend,
      tokenDecimal,
    })
    await bridgeInfoRepo.save(bridgeInfo)
    return bridgeInfo
  }

  async addSolanaBridge(bridgeAddress: string, chainId: string, token: Token) {
    try {
      const existingBridge = await bridgeInfoRepo.findOne({
        bridgeAddress,
        chainId,
        token: { id: token.id },
      })
      if (existingBridge) {
        return existingBridge
      }

      const { owner, program } = solanaWorkspace(bridgeAddress)
      const tokenMint = new PublicKey(token.tokenAddress)

      const [bridgeParamsPda] = PublicKey.findProgramAddressSync(
        [
          SOLANA_PROGRAM_VERSION().toBuffer('be', 8),
          Buffer.from('bridge_params'),
          owner.publicKey.toBuffer(),
          tokenMint.toBuffer(),
          SOL_CHAIN_BUFFER(),
        ],
        program.programId
      )

      const bridgeParams = await program.account.bridgeParams.fetch(bridgeParamsPda)

      if (!bridgeParams) {
        EventLogger.warn(`no params`)
        return
      }

      const fees = {
        feeFulfill: +bridgeParams.feeFulfill.toString(),
        feeSend: +bridgeParams.feeSend.toString(),
      }
      const _limitPerSend = bridgeParams.limitSend.toString().includes('e+')
        ? BigInt(Math.round(Number(bridgeParams.limitSend.toString()))).toString()
        : bridgeParams.limitSend.toString()

      const bridgeInfo = bridgeInfoRepo.create({
        bridgeAddress,
        chainId,
        token,
        fees,
        limitPerSend: _limitPerSend,
        tokenDecimal: token.decimal,
      })
      await bridgeInfoRepo.save(bridgeInfo)
      return bridgeInfo
    } catch (error) {
      console.log(error, 'solana')
    }
  }

  async getTransactionFromOnChain(userAddress: string) {
    try {
      const chainIds = Object.keys(BRIDGEASSISTS)
      const _bridgeAssists = await bridgeInfoRepo.find({})
      const providers: any = {}
      await Promise.all(
        chainIds.map(async (chainId) => {
          if (isSolChain(chainId)) {
            return
          }
          const provider = await _getProvider(chainId as any)
          providers[chainId as ChainId] = provider
        })
      )

      const dbtransactions: Transaction[] = []
      await Promise.all(
        chainIds.map(async (chain) => {
          const chainId = chain
          const chainBridgeAssists = _bridgeAssists.filter((b) => b.chainId === chainId)
          // const chainTokens = tokens.filter((t) => t.chainId === chainId)

          if (isSolChain(chainId)) {
            return
          }

          // if (isSolanaChain(chainId)) {
          //   if (!solAddress) return;
          //   const connection = getConnection();
          //   const signedTx = await getBridgeSolanaTransaction(
          //     solAddress,
          //     bridgeAssist.bridgeAssist,
          //     bridgeAssist.token,
          //     connection,
          //     symbol,
          //     activeRpcs,
          //     bridgeAssists,
          //     allTokens
          //   );
          //   transactions[chainId] = {
          //     totalTransactions: Number(signedTx.length),
          //     signedTransactions: [...signedTx],
          //   };
          //   return;
          // }
          // if (!evmAddress) return;

          const provider = providers[chainId as ChainId]

          for (let bridge of chainBridgeAssists) {
            const contract = anyBridgeAssist(bridge.bridgeAddress, provider)

            const transactions = await contract.getUserTransactions(userAddress)
            for (let transaction of transactions) {
              let existingTransaction = await transactionRepo.findOne({
                userAddress,
                index: +transaction.nonce.toString(),
                chainId,
                bridgeInfo: {
                  id: bridge.id,
                },
              })
              if (existingTransaction) {
                if (existingTransaction.fulfilled) {
                  EventLogger.info(
                    `Transaction ${transaction.nonce.toString()} already fulfilled on ${
                      existingTransaction.toChain
                    }`
                  )
                  continue
                }
                if (isSolChain(existingTransaction.toChain)) {
                  const isFulfilled = await this.processSolanaIsFulfilled(
                    _bridgeAssists,
                    chainId as ChainId,
                    transaction,
                    bridge
                  )
                  existingTransaction.fulfilled = isFulfilled
                  await transactionRepo.save(existingTransaction)
                  continue
                } else {
                  const isFulfilled = await this.processEvmIsFulfilled(
                    _bridgeAssists,
                    providers,
                    transaction,
                    bridge
                  )
                  existingTransaction.fulfilled = isFulfilled
                  await transactionRepo.save(existingTransaction)
                  continue
                }
                // EventLogger.info(`Transaction ${transaction.nonce.toString()} already exists on ${chainId}`)
                // continue
              }
              const toChainId = transaction.toChain.replace('evm.', '') as ChainId
              let isFulfilled = false
              if (isSolChain(toChainId)) {
                isFulfilled = await this.processSolanaIsFulfilled(
                  _bridgeAssists,
                  chainId as ChainId,
                  transaction,
                  bridge
                )
              } else {
                isFulfilled = await this.processEvmIsFulfilled(
                  _bridgeAssists,
                  providers,
                  transaction,
                  bridge
                )
              }

              const txBlock = transaction.block.toString()
              const confirmations = CONFIRMATIONS[chainId as ChainId]

              const transactionDate = new Date(Number(transaction.timestamp) * 1000)
              const transactionObject = transactionRepo.create({
                amount: transaction.amount.toString(),
                timestamp: transaction.timestamp.toString(),
                fromUser: transaction.fromUser,
                toUser: transaction.toUser,
                fromChain: transaction.fromChain.replace('evm.', ''),
                toChain: transaction.toChain.replace('evm.', ''),
                nonce: +transaction.nonce.toString(),
                fulfillAmount: transaction.amount.toString(),
                fulfilled: isFulfilled,
                fulfillToUser: transaction.toUser,
                fulfillFromChain: transaction.fromChain.replace('evm.', ''),
                fulfillNonce: +transaction.nonce.toString(),
                txBlock,
                confirmations,
                transactionDate,
                bridgeInfo: bridge,
                chainId,
                fulfillFromUser: transaction.fromUser,
                index: +transaction.nonce.toString(),
                userAddress: userAddress,
                symbol: bridge.token.symbol,
              })

              EventLogger.info(
                `Created transaction: ${transactionObject.index} on ${chainId}`
              )
              dbtransactions.push(transactionObject)
            }
          }
        })
      )
      await transactionRepo.save(dbtransactions as any)
      const syncTransaction = userTransactionSyncRepo.create({
        userAddress,
        synced: true,
        chainType: ChainType.EVM,
      })
      await userTransactionSyncRepo.save(syncTransaction)
      EventLogger.info(`Inserted ${dbtransactions.length} transactions`)
      return await transactionRepo.findByUserAddress(userAddress)
    } catch (error: any) {
      console.log(error)
      EventLogger.error(`Error inserting transactions: ${error.message}`)
      throw error
    }
  }

  async getSolanaTransactionFromOnChain(userAddress: string) {
    try {
      const chainId = isProd ? 'sol.mainnet' : 'sol.devnet'
      const chainIds = Object.keys(BRIDGEASSISTS)
      const bridgeAssists = await bridgeInfoRepo.find({})
      const solanaBridgeAssists = bridgeAssists.filter((b) => b.chainId === chainId)
      const notSolanaBridgeAssists = bridgeAssists.filter((b) => b.chainId !== chainId)
      const providers: any = {}
      const dbtransactions: Transaction[] = []
      await Promise.all(
        chainIds.map(async (chainId) => {
          if (isSolChain(chainId)) {
            return
          }
          const provider = await _getProvider(chainId as any)
          providers[chainId as ChainId] = provider
        })
      )

      for (let bridgeAssist of solanaBridgeAssists) {
        EventLogger.info(`Processing transactions for ${bridgeAssist.bridgeAddress}`)
        const { owner, program } = solanaWorkspace(bridgeAssist.bridgeAddress)
        const tokenMint = new PublicKey(bridgeAssist.token.tokenAddress)

        const [sendNoncePda] = PublicKey.findProgramAddressSync(
          [
            SOLANA_PROGRAM_VERSION().toBuffer('be', 8),
            Buffer.from('send_nonce'),
            owner.publicKey.toBuffer(),
            tokenMint.toBuffer(),
            new PublicKey(userAddress).toBuffer(),
            SOL_CHAIN_BUFFER(),
          ],
          program.programId
        )
        console.log(sendNoncePda, 'sendNoncePda')

        let nonceAccount
        try {
          nonceAccount = await program.account.userNonce.fetch(sendNoncePda)
          console.log(nonceAccount.nonce.toString(), 'nonceAccount')
        } catch (e: any) {
          // If it doesn't exist yet, default to 0
          if (e.message.includes('Account does not exist')) {
            nonceAccount = { nonce: new BN(0) }
          } else {
            throw e
          }
        }
        const currentNonce = new BN(nonceAccount.nonce)
        console.log(currentNonce.toString(), 'currentNonce')

        // Convert BN to number for array creation
        const nonceCount = Number(currentNonce.toString())

        const transactionPromises = Array.from({ length: nonceCount }, (_, index) => {
          const i = new BN(index)
          return getSolanaSendTx(
            owner,
            tokenMint,
            program,
            new PublicKey(userAddress),
            i.toString(),
            bridgeAssist.chainId
          )
        })
        const transactions = await Promise.all(transactionPromises)
        for (let transaction of transactions) {
          console.log(transaction, 'transaction')
          const existingTransaction = await transactionRepo.findOne({
            userAddress,
            index: +transaction.nonce.toString(),
            chainId: bridgeAssist.chainId,
            bridgeInfo: {
              id: bridgeAssist.id,
            },
          })
          if (existingTransaction) {
            const isFulfilled = await this.processEvmIsFulfilled(
              notSolanaBridgeAssists,
              providers,
              transaction,
              bridgeAssist
            )
            existingTransaction.fulfilled = isFulfilled
            await transactionRepo.save(existingTransaction)
            continue
          }
          const dbTransaction = transactionRepo.create({
            userAddress,
            index: +transaction.nonce.toString(),
            chainId: bridgeAssist.chainId,
            bridgeInfo: bridgeAssist,
            amount: transaction.amount.toString(),
            timestamp: transaction.timestamp.toString(),
            fromUser: userAddress,
            toUser: transaction.toUser,
            fromChain: transaction.fromChain,
            toChain: transaction.toChain,
            nonce: +transaction.nonce.toString(),
            fulfillAmount: transaction.amount.toString(),
            fulfilled: false,
            fulfillToUser: userAddress,
            fulfillFromChain: chainId,
            fulfillNonce: +transaction.nonce.toString(),
            txBlock: transaction.block.toString(),
            confirmations: CONFIRMATIONS[bridgeAssist.chainId as ChainId],
            transactionDate: new Date(Number(transaction.timestamp) * 1000),
            symbol: bridgeAssist.token.symbol,
          })
          EventLogger.info(
            `Created transaction: ${dbTransaction.index} on ${bridgeAssist.chainId}`
          )
          dbtransactions.push(dbTransaction)
        }
        await transactionRepo.save(dbtransactions as any)
        const syncTransaction = userTransactionSyncRepo.create({
          userAddress,
          synced: true,
          chainType: ChainType.SOLANA,
        })
        await userTransactionSyncRepo.save(syncTransaction)
        EventLogger.info(`Inserted ${dbtransactions.length} transactions`)
      }
      return await transactionRepo.findByUserAddress(userAddress)
    } catch (error: any) {
      console.log(error)
      EventLogger.error(`Error inserting transactions: ${error.message}`)
      throw error
    }
  }

  async getUserTransactions(userAddress: string) {
    const _isEvmAddress = isEvmAddress(userAddress)
    const syncTransaction = await userTransactionSyncRepo.findOne({
      userAddress,
      synced: true,
      chainType: _isEvmAddress ? ChainType.EVM : ChainType.SOLANA,
    })
    if (!syncTransaction) {
      if (_isEvmAddress) {
        return await this.getTransactionFromOnChain(userAddress)
      } else {
        return await this.getSolanaTransactionFromOnChain(userAddress)
      }
    }
    return await transactionRepo.findByUserAddress(userAddress)
  }

  async addTransaction(dto: any) {
    try {
      const {
        bridgeAddress,
        chainId,
        index,
        symbol,
        tokenAddress,
        userAddress,
        transactionHash,
      } = dto
      const provider = await _getProvider(chainId as ChainId)
      const contract = anyBridgeAssist(bridgeAddress, provider)
      const transaction = await contract.transactions(userAddress, index)
      if (transaction.block.lte(0)) {
        throw new Error(`Transaction not found`)
      }
      const dbTransaction = await transactionRepo.findOne({
        userAddress,
        index: +index,
        chainId,
        bridgeInfo: {
          bridgeAddress,
        },
        symbol,
      })
      if (dbTransaction) {
        return {
          data: dbTransaction,
          message: 'Transaction already exists',
          success: true,
        }
      }
      const bridgeInfo = await bridgeInfoRepo.findOne({
        bridgeAddress,
        chainId,
      })
      if (!bridgeInfo) {
        throw new Error(`Bridge not found`)
      }
      const newTransaction = transactionRepo.create({
        userAddress,
        index: +index,
        chainId,
        bridgeInfo,
        amount: transaction.amount.toString(),
        timestamp: transaction.timestamp.toString(),
        fromUser: transaction.fromUser,
        toUser: transaction.toUser,
        fromChain: transaction.fromChain,
        toChain: transaction.toChain,
        nonce: +index,
        fulfillAmount: transaction.amount.toString(),
        fulfilled: false,
        fulfillToUser: transaction.toUser,
        fulfillFromChain: transaction.fromChain,
        fulfillNonce: +index,
        txBlock: transaction.block.toString(),
        confirmations: CONFIRMATIONS[chainId as ChainId],
        transactionDate: new Date(Number(transaction.timestamp) * 1000),
        symbol,
        bridgeInfoId: bridgeInfo.id,
        fulfillFromUser: transaction.fromUser,
        transactionHash,
      })
      await transactionRepo.save(newTransaction as any)

      return {
        data: newTransaction,
        message: 'Transaction added successfully',
        success: true,
      }
    } catch (error) {
      throw error
    }
  }

  async isToSolanaTxFulfilled(
    toBridgeAddress: string,
    token: string,
    fromChainId: ChainId,
    _nonce: BigNumber,
    owner: PublicKey,
    program: Program<AssetchainBridgeSolana>
  ): Promise<boolean> {
    const nonce = new BN(_nonce.toString())
    const tokenMint = new PublicKey(token)
    const programId = new PublicKey(toBridgeAddress)

    const CURRENT_CHAIN = 'evm.' + fromChainId

    const [emptyAccount] = PublicKey.findProgramAddressSync(
      [
        SOLANA_PROGRAM_VERSION().toBuffer('be', 8),
        Buffer.from('fulfilled'),
        owner.toBuffer(),
        tokenMint.toBuffer(),
        nonce.toBuffer('be', 8),
        CHAIN_TO_BUFFER(CURRENT_CHAIN),
        SOL_CHAIN_BUFFER(),
      ],
      programId
    )

    console.log(emptyAccount.toBase58(), 'emptyAccount')

    const emptyAccountInfo = await program.provider.connection.getAccountInfo(
      emptyAccount
    )

    return emptyAccountInfo !== null
  }

  async processSolanaIsFulfilled(
    _bridgeAssists: BridgeInfo[],
    chainId: ChainId,
    transaction: TransactionContract,
    bridge: BridgeInfo
  ) {
    const toChainId = transaction.toChain.replace('evm.', '') as ChainId
    const toBridgeAssist = _bridgeAssists.find(
      (b) => b.chainId === toChainId && b.token.symbol === bridge.token.symbol
    )
    if (!toBridgeAssist) return false
    const { owner, program } = solanaWorkspace(toBridgeAssist.bridgeAddress)
    const isFulfilled = await this.isToSolanaTxFulfilled(
      toBridgeAssist.bridgeAddress,
      toBridgeAssist.token.tokenAddress,
      chainId as ChainId,
      transaction.nonce,
      owner.publicKey,
      program
    )
    if (isFulfilled) {
      EventLogger.info(
        `Transaction ${transaction.nonce.toString()} already fulfilled on ${toChainId}`
      )
      return true
    }
    EventLogger.info(
      `Transaction ${transaction.nonce.toString()} not fulfilled on ${toChainId}`
    )
    return false
  }

  async processEvmIsFulfilled(
    _bridgeAssists: BridgeInfo[],
    providers: any,
    transaction: TransactionContract | ITransaction,
    bridge: BridgeInfo
  ) {
    const toChainId = transaction.toChain.replace('evm.', '') as ChainId

    const toBridgeAssist = _bridgeAssists.find(
      (b) => b.chainId === toChainId && b.token.symbol === bridge.token.symbol
    )
    if (!toBridgeAssist) return false
    const toContract = anyBridgeAssist(
      toBridgeAssist.bridgeAddress,
      providers[toChainId as ChainId]
    )
    const fulfilledAt = await toContract.fulfilledAt(
      transaction.fromChain,
      transaction.fromUser,
      transaction.nonce
    )
    return !fulfilledAt.eq(0)
  }
}
