import type { Store, StoreDefinition, _GettersTree } from 'pinia'
import type { Bytes } from 'ethers'

import type { ISigner } from './pure'
import type { ChainId } from '../../types'
import type { WalletHandler, WalletType } from '../../wallets/types'
import type { StoreSettings } from '../../defines'

export interface IWeb3State {
  wallet: string
  signer: ISigner
  chainId: ChainId
  realChainId: string | null
  chainIds: ChainId[]
  DEFAULT_CHAINID: ChainId
  preserveConnection: boolean
  login: boolean
  loading: boolean
  walletType: WalletType | null
  walletHandler: WalletHandler | null
  storeSettings: StoreSettings
  storeLoadings: Record<string, boolean>
}

export interface IWeb3Getters {
  globalLoading: (state: IWeb3State) => boolean
  // signer: (state: IWeb3State) => ISigner
  walletLabel: (state: IWeb3State) => string
}

export interface IWeb3Actions {
  init: () => Promise<void>
  pretend: (address: string, chainId: ChainId) => Promise<void>
  loadAll: () => Promise<void>
  loadBefore: () => Promise<void>
  loadAfter: () => Promise<void>
  connect: (walletType: WalletType) => Promise<void>
  switchChain: (chainId: ChainId) => Promise<boolean>
  disconnect: (chainId: ChainId) => Promise<boolean>
  signMessage: (data: string | Bytes) => Promise<string | null>
  processLoading(storeName: string, loading: boolean): Promise<void>
}

export type IWeb3StoreDefinition = StoreDefinition<
  'web3',
  IWeb3State,
  IWeb3Getters,
  IWeb3Actions
>
export type IWeb3Store = Store<'web3', IWeb3State, IWeb3Getters, IWeb3Actions>
