import { providers } from 'ethers'
import { Provider as MulticallProvider } from 'ethers-multicall'

import {
  chainTags,
  REMOTE_DEV_PREFIX,
  REMOTE_QA_PREFIX,
  REMOTE_TEST_PREFIX,
} from './misc'
import type { ChainTag } from './misc'
import type { ChainId } from './types'

import { node, getConfig } from './node'
import { ToRealChainIds } from './defines'

import contracts from '@/contracts/contracts.json'

export const toRealChainIds = (chainId: ChainId): ToRealChainIds<ChainId> => {
  if (
    chainId.startsWith(REMOTE_DEV_PREFIX) ||
    chainId.startsWith(REMOTE_TEST_PREFIX) ||
    chainId.startsWith(REMOTE_QA_PREFIX)
  )
    return chainId

  switch (import.meta.env.VITE_MODE) {
    case 'dev':
      return (REMOTE_DEV_PREFIX + chainId) as ToRealChainIds<ChainId>
    case 'test':
      return (REMOTE_TEST_PREFIX + chainId) as ToRealChainIds<ChainId>
    case 'qa':
      return (REMOTE_QA_PREFIX + chainId) as ToRealChainIds<ChainId>
  }
  return chainId
}
export const toMainChainIds = (chainId: ToRealChainIds<ChainId>): ChainId => {
  if (
    !chainId.startsWith(REMOTE_DEV_PREFIX) &&
    !chainId.startsWith(REMOTE_TEST_PREFIX) &&
    !chainId.startsWith(REMOTE_QA_PREFIX)
  )
    return chainId as ChainId

  return chainId.slice(REMOTE_DEV_PREFIX.length) as ChainId
}

export function getChainTag(chainId: ToRealChainIds<ChainId>): ChainTag {
  /// @ts-ignore
  if (!chainTags[chainId as keyof typeof chainTags]) return 'localhost'
  /// @ts-ignore
  return chainTags[chainId as keyof typeof chainTags] as ChainTag
}

export function getChainRpc(chainId: ChainId): string {
  return node(getChainTag(toRealChainIds(chainId))).rpc
}

export function getChainName(chainId: ChainId): string {
  return node(getChainTag(toRealChainIds(chainId))).name
}

export function getChainHex(chainId: ChainId): string {
  return '0x' + node(getChainTag(toRealChainIds(chainId))).chainId.toString(16)
}

export function getChainScanner(chainId: ChainId): string {
  return node(getChainTag(toRealChainIds(chainId))).scanner
}

export function getProvider(chainId: ChainId): providers.JsonRpcProvider {
  return new providers.JsonRpcProvider(
    getChainRpc(chainId),
    parseInt(toRealChainIds(chainId)),
  )
}

export function getMulticallProvider(chainId: ChainId): MulticallProvider {
  const provider = getProvider(chainId)

  if (
    chainId.startsWith(REMOTE_DEV_PREFIX) ||
    chainId.startsWith(REMOTE_TEST_PREFIX) ||
    chainId.startsWith(REMOTE_QA_PREFIX)
  )
    return new MulticallProvider(
      provider,
      parseInt(chainId.slice(REMOTE_DEV_PREFIX.length)),
    )
  return new MulticallProvider(provider, parseInt(chainId))
}

export type ContractsName<
  SelectedChainId extends ToRealChainIds<ChainId> = ToRealChainIds<ChainId>,
> =
  /// @ts-ignore
  keyof (typeof contracts)[Extract<
    SelectedChainId,
    keyof typeof contracts
  >][0]['contracts']

export function getContractsInfo<SelectedChainId extends ChainId = ChainId>(
  chainId: SelectedChainId,
): Record<ContractsName<ToRealChainIds<SelectedChainId>>, { address: string; abi: any }> {
  /// @ts-ignore
  if (Object.keys(contracts).length === 0) return null
  /// @ts-ignore
  return contracts[toRealChainIds(chainId)][0].contracts as any
}

export function getChainDescription(chainId: ChainId) {
  return getConfig(getChainTag(toRealChainIds(chainId)))
}

export const scannersLink = {
  getTx: (chainId: ChainId, tx: string) => getChainScanner(chainId) + 'tx/' + tx,
  getBlock: (chainId: ChainId, block: string) =>
    getChainScanner(chainId) + 'block/' + block,
  getAddress: (chainId: ChainId, address: string) =>
    getChainScanner(chainId) + 'address/' + address,
}
