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
import { _oldRWABridge, BRIDGEASSISTS } from '@/utils/constant'
import { _getProvider, isEvmAddress, isSolChain, useOldRwaBridge } from '@/utils/helpers'
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
import {
  AddTransactionDto,
  ChainType,
  ITransaction,
  MarkTransactionAsClaimedDto,
  TransactionContract,
} from '@/types'
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

  async getTransactionFromOnChain(
    userAddress: string,
    options: any,
    _chainIds?: string[],
    _fulfilled?: boolean,
    symbol?: string
  ) {
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
        _bridgeAssists.map(async (bridgeAssist) => {
          const chainId = bridgeAssist.chainId
          if (isSolChain(chainId)) {
            return
          }
          const provider = providers[chainId as ChainId]
          const contract = anyBridgeAssist(bridgeAssist.bridgeAddress, provider)
          const transactions = await contract.getUserTransactions(userAddress)
          await Promise.all(
            transactions.map(async (transaction, index) => {
              // console.log(transaction.nonce.toString(), 'dkdkdkdkd')
              // console.log(+transaction.nonce.toString(), '043489')
              let existingTransaction = await transactionRepo.findOne({
                userAddress,
                index: index,
                bridgeInfo: {
                  id: bridgeAssist.id,
                },
              })
              if (existingTransaction) {
                if (existingTransaction.fulfilled) {
                  return
                }
                if (isSolChain(existingTransaction.toChain)) {
                  const isFulfilled = await this.processSolanaIsFulfilled(
                    _bridgeAssists,
                    chainId as ChainId,
                    transaction,
                    bridgeAssist
                  )
                  existingTransaction.fulfilled = isFulfilled
                  await transactionRepo.save(existingTransaction)
                  return
                } else {
                  const isFulfilled = await this.processEvmIsFulfilled(
                    _bridgeAssists,
                    providers,
                    transaction,
                    bridgeAssist
                  )
                  existingTransaction.fulfilled = isFulfilled
                  await transactionRepo.save(existingTransaction)
                  return
                }
              }
              const toChainId = transaction.toChain.replace('evm.', '') as ChainId
              let isFulfilled = false
              if (isSolChain(toChainId)) {
                isFulfilled = await this.processSolanaIsFulfilled(
                  _bridgeAssists,
                  chainId as ChainId,
                  transaction,
                  bridgeAssist
                )
              } else {
                isFulfilled = await this.processEvmIsFulfilled(
                  _bridgeAssists,
                  providers,
                  transaction,
                  bridgeAssist
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
                bridgeInfo: bridgeAssist,
                chainId,
                fulfillFromUser: transaction.fromUser,
                index: index,
                userAddress: userAddress,
                symbol: bridgeAssist.token.symbol,
              })

              EventLogger.info(
                `Created transaction: ${transactionObject.index} on ${chainId}`
              )
              dbtransactions.push(transactionObject)
            })
          )
        })
      )
      await transactionRepo.save(dbtransactions as any)
      let syncTransaction = await userTransactionSyncRepo.findOne({
        userAddress,
        synced: true,
        chainType: ChainType.EVM,
      })
      if (!syncTransaction) {
        syncTransaction = userTransactionSyncRepo.create({
          userAddress,
          synced: true,
          chainType: ChainType.EVM,
        })
        await userTransactionSyncRepo.save(syncTransaction)
      }

      EventLogger.info(`Inserted ${dbtransactions.length} transactions`)
      return await transactionRepo.findTransactionsByUserWithPagination(
        userAddress,
        options,
        _chainIds,
        _fulfilled,
        symbol
      )
    } catch (error: any) {
      console.log(error)
      EventLogger.error(`Error inserting transactions: ${error.message}`)
      throw error
    }
  }

  async getSolanaTransactionFromOnChain(
    userAddress: string,
    options: any,
    _chainIds: string[],
    _fulfilled?: boolean,
    _symbol?: string
  ) {
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
        // console.log(sendNoncePda, 'sendNoncePda')

        let nonceAccount
        try {
          nonceAccount = await program.account.userNonce.fetch(sendNoncePda)
          EventLogger.info(`nonceAccount: ${nonceAccount.nonce.toString()}`)
        } catch (e: any) {
          // If it doesn't exist yet, default to 0
          if (e.message.includes('Account does not exist')) {
            nonceAccount = { nonce: new BN(0) }
          } else {
            throw e
          }
        }
        const currentNonce = new BN(nonceAccount.nonce)
        EventLogger.info(`currentNonce: ${currentNonce.toString()}`)

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
        for (let index = 0; index < transactions.length; index++) {
          const transaction = transactions[index]
          const existingTransaction = await transactionRepo.findOne({
            userAddress,
            index: index,
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
          const isFulfilled = await this.processEvmIsFulfilled(
            notSolanaBridgeAssists,
            providers,
            transaction,
            bridgeAssist
          )
          const dbTransaction = transactionRepo.create({
            userAddress,
            index: index,
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
            fulfilled: isFulfilled,
            fulfillToUser: transaction.toUser,
            fulfillFromChain: chainId,
            fulfillNonce: +transaction.nonce.toString(),
            txBlock: transaction.block.toString(),
            confirmations: CONFIRMATIONS[bridgeAssist.chainId as ChainId],
            transactionDate: new Date(Number(transaction.timestamp) * 1000),
            symbol: bridgeAssist.token.symbol,
            fulfillFromUser: userAddress,
          })
          EventLogger.info(
            `Created transaction: ${dbTransaction.index} on ${bridgeAssist.chainId}`
          )
          dbtransactions.push(dbTransaction)
        }
        await transactionRepo.save(dbtransactions as any)
        let syncTransaction = await userTransactionSyncRepo.findOne({
          userAddress,
          synced: true,
          chainType: ChainType.SOLANA,
        })
        if (!syncTransaction) {
          syncTransaction = userTransactionSyncRepo.create({
            userAddress,
            synced: true,
            chainType: ChainType.SOLANA,
          })
          await userTransactionSyncRepo.save(syncTransaction)
        }
        EventLogger.info(`Inserted ${dbtransactions.length} transactions`)
      }
      return await transactionRepo.findTransactionsByUserWithPagination(
        userAddress,
        options,
        _chainIds,
        _fulfilled,
        _symbol
      )
    } catch (error: any) {
      console.log(error)
      EventLogger.error(`Error inserting transactions: ${error.message}`)
      throw error
    }
  }

  async getUserTransactions(
    userAddress: string,
    options: any,
    secondaryAddress?: string,  
    _chainIds?: string,
    _fulfilled?: string,
    forceSync?: string,
    symbol?: string
  ) {
    const _isEvmAddress = isEvmAddress(userAddress)
    const dbChainIds = _chainIds ? _chainIds.split(',') : []
    const dbFulfilled = _fulfilled ? (_fulfilled === 'true' ? true : false) : undefined
    const dbForceSync = forceSync ? (forceSync === 'true' ? true : false) : undefined
    EventLogger.info(`_chainIds: ${_chainIds}, _fulfilled: ${_fulfilled}, forceSync: ${forceSync}, symbol: ${symbol}`)

    EventLogger.info(`dbChainIds: ${dbChainIds}, dbFulfilled: ${dbFulfilled}, dbForceSync: ${dbForceSync}`)
    const syncTransaction = await userTransactionSyncRepo.findOne({
      userAddress,
      synced: true,
      chainType: _isEvmAddress ? ChainType.EVM : ChainType.SOLANA,
    })
    if (dbForceSync || !syncTransaction) {
      if (_isEvmAddress) {
        return await this.getTransactionFromOnChain(
          userAddress,
          options,
          dbChainIds,
          dbFulfilled,
          symbol
        )
      } else {
        return await this.getSolanaTransactionFromOnChain(
          userAddress,
          options,
          dbChainIds,
          dbFulfilled,
          symbol
        )
      }
    }
    return await transactionRepo.findTransactionsByUserWithPagination(
      userAddress,
      options,
      dbChainIds,
      dbFulfilled,
      symbol,
      secondaryAddress
    )
  }

  async addTransaction(dto: AddTransactionDto) {
    try {
      const {
        index,

        userAddress,
        transactionHash,
        bridgeId,
      } = dto
      const bridgeInfo = await bridgeInfoRepo.findById(bridgeId)
      if (!bridgeInfo) throw new Error(`Bridge not found`)
      const chainId = bridgeInfo.chainId
      if (isSolChain(chainId)) {
        const { owner, tokenMint, program, connection } = solanaWorkspace(
          bridgeInfo.bridgeAddress
        )
        const tx = await getSolanaSendTx(
          owner,
          tokenMint,
          program,
          new PublicKey(userAddress),
          index,
          chainId
        )
        if (tx.block.lte(0)) {
          throw new Error(`Transaction not found`)
        }
        const dbTransaction = await transactionRepo.findOne({
          userAddress,
          index: +index,
          bridgeInfo: { id: bridgeId },
        })
        if (dbTransaction) {
          return {
            data: dbTransaction,
            message: 'Transaction already exists',
            success: true,
          }
        }
        // const bridgeInfo = await bridgeInfoRepo.findOne({
        //   bridgeAddress,
        //   chainId,
        // })
        const newTransaction = transactionRepo.create({
          userAddress,
          index: +index,
          chainId,
          bridgeInfo,
          amount: tx.amount.toString(),
          timestamp: tx.timestamp.toString(),
          fromUser: tx.fromUser,
          toUser: tx.toUser,
          fromChain: tx.fromChain,
          toChain: tx.toChain.replace('evm.', ''),
          nonce: +tx.nonce.toString(),
          fulfillAmount: tx.amount.toString(),
          fulfilled: false,
          fulfillToUser: tx.toUser,
          fulfillFromChain: tx.fromChain.replace('evm.', ''),
          fulfillNonce: +tx.nonce.toString(),
          txBlock: tx.block.toString(),
          confirmations: CONFIRMATIONS[chainId as ChainId],
          transactionDate: new Date(Number(tx.timestamp) * 1000),
          symbol: bridgeInfo.token.symbol,
          bridgeInfoId: bridgeInfo.id,
          fulfillFromUser: tx.fromUser,
          transactionHash,
        })
        await transactionRepo.save(newTransaction as any)

        return {
          data: newTransaction,
          message: 'Transaction added successfully',
          success: true,
        }
      }
      const provider = await _getProvider(chainId as ChainId)
      const contract = anyBridgeAssist(bridgeInfo.bridgeAddress, provider)
      const transaction = await contract.transactions(userAddress, index)
      if (transaction.block.lte(0)) {
        throw new Error(`Transaction not found`)
      }
      const dbTransaction = await transactionRepo.findOne({
        userAddress,
        index: +index,
        bridgeInfo: {
          id: bridgeId,
        },
      })
      if (dbTransaction) {
        return {
          data: dbTransaction,
          message: 'Transaction already exists',
          success: true,
        }
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
        fromChain: transaction.fromChain.replace('evm.', ''),
        toChain: transaction.toChain.replace('evm.', ''),
        nonce: +transaction.nonce.toString(),
        fulfillAmount: transaction.amount.toString(),
        fulfilled: false,
        fulfillToUser: transaction.toUser,
        fulfillFromChain: transaction.fromChain.replace('evm.', ''),
        fulfillNonce: +transaction.nonce.toString(),
        txBlock: transaction.block.toString(),
        confirmations: CONFIRMATIONS[chainId as ChainId],
        transactionDate: new Date(Number(transaction.timestamp) * 1000),
        symbol: bridgeInfo.token.symbol,
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

  async markTransactionAsClaimed(dto: MarkTransactionAsClaimedDto) {
    try {
      const { transactionId, claimTransactionHash, toBridgeId } = dto
      const dbTransaction = await transactionRepo.findById(transactionId)
      if (!dbTransaction) throw new Error(`Transaction not found`)
      if (dbTransaction.fulfilled) {
        return {
          data: dbTransaction,
          message: 'Transaction already fulfilled',
          success: true,
        }
      }
      const chainId = dbTransaction.toChain.replace('evm.', '')
      const toBridgeInfo = await bridgeInfoRepo.findById(toBridgeId)
      if (!toBridgeInfo) throw new Error(`Bridge not found`)
      if (isSolChain(chainId)) {
        const { owner, tokenMint, program, connection } = solanaWorkspace(
          toBridgeInfo.bridgeAddress
        )
        const isFulfilled = await this.isToSolanaTxFulfilled(
          toBridgeInfo.bridgeAddress,
          toBridgeInfo.token.tokenAddress,
          dbTransaction.fromChain.replace('evm.', '') as ChainId,
          BigNumber.from(dbTransaction.nonce),
          owner.publicKey,
          program
        )
        if (isFulfilled) {
          dbTransaction.fulfilled = true
          dbTransaction.claimTransactionHash = claimTransactionHash
          await transactionRepo.save(dbTransaction)
        }
        return {
          data: dbTransaction,
          message: 'Transaction marked as claimed',
          success: true,
        }
      }
      const provider = await _getProvider(chainId as ChainId)
      const contract = anyBridgeAssist(toBridgeInfo.bridgeAddress, provider)
      let fromChain = dbTransaction.fromChain.replace(`evm.`, '')
      if (!isSolChain(fromChain)){
        fromChain = `evm.${fromChain}`
      }
      const fulfilledAt = await contract.fulfilledAt(
        fromChain,
        dbTransaction.fromUser,
        dbTransaction.nonce
      )
      const isFulfilled = !fulfilledAt.eq(0)
      if (isFulfilled) {
        dbTransaction.fulfilled = true
        dbTransaction.claimTransactionHash = claimTransactionHash
        await transactionRepo.save(dbTransaction)
      }

      return {
        data: dbTransaction,
        message: 'Transaction marked as claimed',
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

    // console.log(emptyAccount.toBase58(), 'emptyAccount')

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
    let symbol = bridge.token.symbol
    const toBridgeAssist = _bridgeAssists.find(
      (b) => b.chainId === toChainId && b.token.symbol === symbol
    )
    if (!toBridgeAssist) {
      EventLogger.info(`To Bridge not found`)
      return false
    }
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
    if (!toBridgeAssist) {
      EventLogger.warn(`To Bridge assist not found`)
      return false
    }
    let oldRwaAssist = false
    if (
      toBridgeAssist.token.symbol.toLowerCase() === 'rwa' &&
      useOldRwaBridge(transaction.timestamp)
    ) {
      oldRwaAssist = true
    }
    const toContract = anyBridgeAssist(
      oldRwaAssist ? _oldRWABridge : toBridgeAssist.bridgeAddress,
      providers[toChainId as ChainId]
    )
    const fulfilledAt = await toContract.fulfilledAt(
      transaction.fromChain,
      transaction.fromUser,
      transaction.nonce
    )
    return !fulfilledAt.eq(0)
  }

  async getAllBridges() {
    const bridges = await bridgeInfoRepo.find({})
    return bridges
  }
}
