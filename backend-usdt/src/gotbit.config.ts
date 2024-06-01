import { addContractI, defineConfig } from '@/gotbit-tools/node/config'
import { universalRpc } from '@/gotbit-tools/node/rpc'

export const IS_PROD = process.env.PROD === 'true'

// https://api-sepolia.arbiscan.io/api
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
      default:
        return uni(chainTag)
    }
  },
})

import { defineContracts } from '@/gotbit-tools/node/config'
import type { BridgeAssist, Token } from '@/contracts/typechain'
import { addContractWithAddress } from './gotbit-tools/node/utils/contracts/add'

export const contracts = defineContracts({
  token: addContractI<Token>('Token'),
  bridgeAssist: addContractWithAddress<BridgeAssist>('BridgeAssist'),
  '97': {},
  '42421': {},
  '421614': {},
})
