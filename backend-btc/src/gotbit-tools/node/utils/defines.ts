import type { BaseContract } from 'ethers'
import type { ChainId } from '../types'
import { REMOTE_PREFIX } from './misc'
import type { IContractStoreDefinition } from './stores/types/pure'

export type ToRealChainIds<c extends ChainId> = `${REMOTE_PREFIX}${c}` | c

export type ContractFunction<SelectedChainId extends ToRealChainIds<ChainId>> = (
  chainId: SelectedChainId
) => BaseContract | ((address: string) => BaseContract)

export type InChainContracts = {
  [SelectedChainId in ChainId]: Record<
    string,
    ContractFunction<ToRealChainIds<SelectedChainId>>
  >
}

export function defineContracts<Contracts extends InChainContracts>(
  contracts: Contracts
) {
  return contracts
}

export type ContractStoreImport = Promise<IContractStoreDefinition>
