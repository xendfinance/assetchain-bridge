import { addContractI, defineConfig } from '@/gotbit-tools/node/config'
import { universalRpc } from '@/gotbit-tools/node/rpc'

export const IS_PROD = process.env.PROD === 'true'

export const config = defineConfig({
  chainIds: ['97', '42421', '421614'],
  // DEFAULT_CHAINID: IS_PROD ? '56' : '97',
  DEFAULT_CHAINID: '97',
  rpc: (chainTag) => {
    const uni = universalRpc()
    console.log('chainTag', uni(chainTag));

    switch (chainTag) {
      case 'arbitrum_sepolia':
        return 'https://public.stackup.sh/api/v1/node/arbitrum-sepolia'
      case 'xend_testnet':
        return 'https://enugu-rpc.assetchain.org/'
      case 'bsc_testnet':
        return 'https://bsc-testnet-rpc.publicnode.com'
      case 'eth_sepolia':
        return 'https://ethereum-sepolia-rpc.publicnode.com'
      case 'polygon_amoy':
        return 'https://rpc-amoy.polygon.technology'
      case 'base_sepolia':
        return 'https://sepolia.base.org'

      default:
        return uni(chainTag)
    }
  },
})

import type {
  BridgeAssist,
  ERC20
} from '@/contracts/typechain'
import { defineContracts } from '@/gotbit-tools/node/config'
import { addContractWithAddress } from './gotbit-tools/node/utils/contracts/add'


export const contracts = defineContracts({
  bridgeAssist: addContractWithAddress<BridgeAssist>('BridgeAssist'),
  anyToken: addContractI<ERC20>('Token'),
  '97': {
  },
  '42421': {
  },
  '421614': {
  }
})
