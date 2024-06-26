import type { ChainId } from '@/gotbit-tools/vue/types'
import { BigNumber } from 'ethers'

export interface TrasactionData {
  fromUser: string
  toUser: string
  timestamp: number
  amount: BigNumber
  toChain: ChainId
  fromChain: ChainId
  nonce: number
}

export interface TrasactionRawData {
  fromUser: string
  toUser: string
  timestamp: number
  amount: string
  toChain: string
  fromChain: string
  nonce: number
}

export interface FulfillTx {
  amount: string
  fromChain: string
  nonce: number
  fromUser: string
  toUser: string
}

export interface HistoryData {
  transaction: TrasactionData
  fulfillTransaction: FulfillTx
  fulfilled: boolean
  claimInfo: {
    txBlock: number
    confirmations: number
  }
  symbol: string
}

export interface HistoryRawData {
  transaction: TrasactionRawData
  fulfillTransaction: FulfillTx
  fulfilled: boolean
  claimInfo: {
    txBlock: number
    confirmations: number
  }
}
