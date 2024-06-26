import { useContracts } from '@/gotbit-tools/vue'
import { Wallet, ethers, BigNumber, BigNumberish } from 'ethers'
import { contracts } from '@/gotbit.config'

export type Transaction = {
  amount: string
  timestamp: string
  fromUser: string
  toUser: string // can be a solana address
  fromChain: string
  toChain: string
  nonce: string
}

export type FulfillTxContract = {
  amount: BigNumberish
  fromChain: string
  nonce: BigNumberish
  fromUser: string
  toUser: string
}

export type FulfillTx = {
  amount: string
  fromChain: string
  nonce: string
  fromUser: string
  toUser: string
}

const bridgeWithAddress = contracts['97']['anyBridgeAssist']('97')(
  '0x4F18a162dcfa08bB7797DbBCd910F4A0c0FaE1a3'
)

type UseContracts = typeof bridgeWithAddress

export type TransactionContract = Awaited<
  ReturnType<UseContracts['getUserTransactions']>
>[number]

export type FulfillInfo = { txBlock: number; confirmations: number }

export type TransactionAndFulfilled = {
  transaction: Transaction
  fulfillTransaction: FulfillTx
  fulfilled: boolean
  claimInfo: FulfillInfo
}

export const extractTransaction = (tx: TransactionContract) => {
  return {
    amount: tx.amount,
    timestamp: tx.timestamp.toString(),
    fromUser: tx.fromUser,
    toUser: tx.toUser,
    fromChain: tx.fromChain.toString(),
    toChain: tx.toChain.toString(),
    nonce: tx.nonce.toString(),
  }
}

export const extractFulfillTransaction = (tx: TransactionContract) => {
  return {
    amount: tx.amount.toString(),
    fromChain: tx.fromChain.toString(),
    nonce: Number(tx.nonce.toString()),
    fromUser: tx.fromUser.toString(),
    toUser: tx.toUser.toString(),
  }
}
