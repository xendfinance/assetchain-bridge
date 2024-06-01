import type { BaseContract } from 'ethers'
import type {
  ChainId,
  ChangeChainCallbackFunction,
  ChangeWalletCallbackFunction,
} from '../types'
import { REMOTE_PREFIX } from './misc'
import type { IContractStoreDefinition } from './stores/types/pure'

export type ToRealChainIds<c extends ChainId> = `${REMOTE_PREFIX}${c}` | c

export type ContractFunction<SelectedChainId extends ChainId> = (
  chainId: SelectedChainId,
) => BaseContract | ((address: string) => BaseContract)

export type InChainContracts = {
  [SelectedChainId in ChainId]: Record<string, ContractFunction<SelectedChainId>>
}

export function defineContracts<Contracts extends InChainContracts>(
  contracts: Contracts,
) {
  return contracts
}

export type Options = {
  preventDefaultChangeWallet?: boolean
  preventDefaultChangeChain?: boolean

  updateOnWalletChange?: boolean
  updateOnChainChange?: boolean

  preserveConnection?: boolean
  globalLoading?: boolean
}

export type ContractStoreImport = Promise<IContractStoreDefinition>

export type StoreSettings = {
  stores: ContractStoreImport[]
  options?: Options
}

export function defineStoreSettings<T extends StoreSettings['stores']>(
  contractStore: T,
  options?: Options,
): StoreSettings {
  return { stores: contractStore, options }
}
