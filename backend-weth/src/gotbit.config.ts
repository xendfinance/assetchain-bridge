import { addContractI, defineConfig } from '@/gotbit-tools/node/config'
import { universalRpc } from '@/gotbit-tools/node/rpc'

export const IS_PROD = process.env.PROD === 'true'

export const config = defineConfig({
  chainIds: ['97', '42421', '421614'],
  // DEFAULT_CHAINID: IS_PROD ? '56' : '97',
  DEFAULT_CHAINID: '97',
  rpc: universalRpc(),
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
