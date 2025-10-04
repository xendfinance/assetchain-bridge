import { ChainId } from '@/gotbit-tools/node/types'
import {
  blockscanInfoRepo,
  bridgeInfoRepo,
  tokenRepo,
  transactionRepo,
  userTransactionSyncRepo,
} from '@/lib/database'
import { Token } from '@/lib/database/entities/Token'
import { BRIDGEASSISTS } from '@/utils/constant'
import { _getProvider } from '@/utils/helpers'
import { anyBridgeAssist } from '@/utils/useContracts'
import { providers } from 'ethers'
import CONFIRMATIONS from '../confirmations.json'
import { Transaction } from '@/lib/database/entities/Transaction'
import EventLogger from '@/lib/logger/index.logger'
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

  async getTransactionFromOnChain(userAddress: string) {
    try {
      const chainIds = Object.keys(BRIDGEASSISTS)
      const _bridgeAssists = await bridgeInfoRepo.find({})
      const providers: any = {}
      await Promise.all(
        chainIds.map(async (chainId) => {
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
                EventLogger.info(`Transaction ${transaction.nonce.toString()} already exists on ${chainId}`)
                continue
              }
              const toChainId = transaction.toChain.replace('evm.', '') as ChainId
              const toBridgeAssist = _bridgeAssists.find(
                (b) => b.chainId === toChainId && b.token.symbol === bridge.token.symbol
              )
              if (!toBridgeAssist) continue
              const toContract = anyBridgeAssist(
                toBridgeAssist.bridgeAddress,
                providers[toChainId as ChainId]
              )
              const fulfilledAt = await toContract.fulfilledAt(
                transaction.fromChain,
                transaction.fromUser,
                transaction.nonce
              )
              const isFulfilled = !fulfilledAt.eq(0)
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

  async getUserTransactions(userAddress: string) {
    const syncTransaction = await userTransactionSyncRepo.findOne({
      userAddress,
      synced: true,
    })
    if (!syncTransaction) {
      return await this.getTransactionFromOnChain(userAddress)
    }
    return await transactionRepo.findByUserAddress(userAddress)
  }

  async addTransaction(dto: any){
    try {
      const {bridgeAddress, chainId, index, symbol, tokenAddress, userAddress, transactionHash} = dto
      const provider = await _getProvider(chainId as ChainId)
      const contract = anyBridgeAssist(bridgeAddress, provider)
      const transaction = await contract.transactions(userAddress, index)
      if (transaction.block.lte(0)){
        throw new Error(`Transaction not found`)
      }
      const dbTransaction = await transactionRepo.findOne({
        userAddress,
        index: +index,
        chainId,
        bridgeInfo: {
          bridgeAddress,
        },
        symbol
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
}
