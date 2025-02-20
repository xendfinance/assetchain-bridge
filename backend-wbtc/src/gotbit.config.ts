import { addContractI, defineConfig } from '@/gotbit-tools/node/config'
import { universalRpc } from '@/gotbit-tools/node/rpc'

export const IS_PROD = process.env.PROD === 'true'

export const config = defineConfig({
  chainIds: ['97', '42421', '421614', '200810', '200901', '42420', '42161', '56', '8453', '84532', '1'],
  // DEFAULT_CHAINID: IS_PROD ? '56' : '97',
  DEFAULT_CHAINID: '97',
  rpc: universalRpc(),
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
  '200810': {},
  '200901': {},
  '42420': {},
  '42161': {},
  '56': {},
  '8453': {},
  '84532': {},
  '1': {}
})
