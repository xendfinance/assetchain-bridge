import { ChainTag } from './misc'
import { node, getConfig } from './node'

export function getChainRpc(chainTag: ChainTag): string {
  return node(chainTag).rpc
}

export function getChainName(chainTag: ChainTag): string {
  return node(chainTag).name
}

export function getChainHex(chainTag: ChainTag): string {
  return '0x' + node(chainTag).chainId.toString(16)
}

export function getChainScanner(chainTag: ChainTag): string {
  return node(chainTag).scanner
}

export function getChainDescription(chainTag: ChainTag) {
  return getConfig(chainTag)
}

export const scannersLink = {
  getTx: (chainTag: ChainTag, tx: string) => getChainScanner(chainTag) + 'tx/' + tx,
  getBlock: (chainTag: ChainTag, block: string) =>
    getChainScanner(chainTag) + 'block/' + block,
  getAddress: (chainTag: ChainTag, address: string) =>
    getChainScanner(chainTag) + 'address/' + address,
}
