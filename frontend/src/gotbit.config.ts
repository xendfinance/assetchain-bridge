import {
  addContract,
  addContractI,
  addContractWithAddress,
  addContractWithAddressI,
  defineConfig,
} from '@/gotbit-tools/vue/config'
import { universalRpc, extraRpc } from '@/gotbit-tools/vue/rpc'

export const IS_DEBUG = import.meta.env.VITE_DEBUG === 'true'
export const XEND_CHAIN = '42421'

export const config = defineConfig({
  DEBUG: IS_DEBUG,
  chainIds: ['97', '421614', '42421', '11155111', '80002', '84532', '200810'],
  DEFAULT_CHAINID: IS_DEBUG ? '42421' : '42421',
  rpc: (chainTag) => {
    const uni = universalRpc()

    switch (chainTag) {
      case 'arbitrum_sepolia':
        return 'https://public.stackup.sh/api/v1/node/arbitrum-sepolia'
      case 'xend_testnet':
        return 'https://enugu-rpc.assetchain.org/'
      case 'bsc_testnet':
        return 'https://bsc-testnet-rpc.publicnode.com'
      case 'eth_sepolia':
        return 'https://ethereum-sepolia-rpc.publicnode.com'
      case 'base_sepolia':
        return 'https://public.stackup.sh/api/v1/node/base-sepolia'
      default:
        return uni(chainTag)
    }
  },
})

import { defineContracts } from '@/gotbit-tools/vue/config'
import type {
  BridgeAssistTransferUpgradeable,
  BridgeAssistMintUpgradeable,
  BridgeAssistNativeUpgradeable,
  BridgeFactoryUpgradeable,
  ERC20,
} from '@/contracts/typechain'
export const contracts = defineContracts({
  bridgeFactory: addContract<BridgeFactoryUpgradeable>('BridgeFactoryUpgradeable'),
  anyToken: addContractWithAddressI<ERC20>('USDT'),
  '97': {
    bridgeFactory: addContractI<BridgeFactoryUpgradeable, '97'>(
      'BridgeFactoryUpgradeable'
    ),
    anyBridgeAssist: addContractWithAddressI<BridgeAssistTransferUpgradeable, '97'>(
      'BridgeAssistTransferUpgradeable'
    ),
    bridgeAssistNative: addContractWithAddressI<BridgeAssistNativeUpgradeable, '97'>(
      'BridgeAssistNativeUpgradeable'
    ),
  },
  '42421': {
    anyBridgeAssistMint: addContractWithAddress<BridgeAssistMintUpgradeable, '42421'>(
      'BridgeAssistMintUpgradeable'
    ),
    BridgeAssistNative: addContractI<BridgeAssistNativeUpgradeable, '42421'>(
      'BridgeAssistNativeUpgradeable'
    ),
    bridgeFactory: addContractI<BridgeFactoryUpgradeable, '42421'>(
      'BridgeFactoryUpgradeable'
    ),
  },
  '421614': {
    bridgeFactory: addContractI<BridgeFactoryUpgradeable, '421614'>(
      'BridgeFactoryUpgradeable'
    ),
    anyBridgeAssist: addContractWithAddressI<BridgeAssistTransferUpgradeable, '421614'>(
      'BridgeAssistTransferUpgradeable'
    ),
    bridgeAssistNative: addContractWithAddressI<BridgeAssistNativeUpgradeable, '421614'>(
      'BridgeAssistNativeUpgradeable'
    ),
  },
  '11155111': {
    bridgeFactory: addContractI<BridgeFactoryUpgradeable, '11155111'>(
      'BridgeFactoryUpgradeable'
    ),
    anyBridgeAssist: addContractWithAddressI<BridgeAssistTransferUpgradeable, '11155111'>(
      'BridgeAssistTransferUpgradeable'
    ),
    bridgeAssistNative: addContractWithAddressI<BridgeAssistNativeUpgradeable, '11155111'>(
      'BridgeAssistNativeUpgradeable'
    ),
  },
  '80002': {
    bridgeFactory: addContractI<BridgeFactoryUpgradeable, '80002'>(
      'BridgeFactoryUpgradeable'
    ),
    anyBridgeAssist: addContractWithAddressI<BridgeAssistTransferUpgradeable, '80002'>(
      'BridgeAssistTransferUpgradeable'
    ),
    bridgeAssistNative: addContractWithAddressI<BridgeAssistNativeUpgradeable, '80002'>(
      'BridgeAssistNativeUpgradeable'
    ),
  },
  '84532': {
    bridgeFactory: addContractI<BridgeFactoryUpgradeable, '84532'>(
      'BridgeFactoryUpgradeable'
    ),
    anyBridgeAssist: addContractWithAddressI<BridgeAssistTransferUpgradeable, '84532'>(
      'BridgeAssistTransferUpgradeable'
    ),
    bridgeAssistNative: addContractWithAddressI<BridgeAssistNativeUpgradeable, '84532'>(
      'BridgeAssistNativeUpgradeable'
    ),
  },
  '200810': {
    bridgeFactory: addContractI<BridgeFactoryUpgradeable, '200810'>(
      'BridgeFactoryUpgradeable'
    ),
    anyBridgeAssist: addContractWithAddressI<BridgeAssistTransferUpgradeable, '200810'>(
      'BridgeAssistTransferUpgradeable'
    ),
    bridgeAssistNative: addContractWithAddressI<BridgeAssistNativeUpgradeable, '200810'>(
      'BridgeAssistNativeUpgradeable'
    ),
  },
})

import { defineStoreSettings } from '@/gotbit-tools/vue/config'
export const storeSettings = defineStoreSettings(
  [
    import('@/store/contracts/factory').then((_) => _.useFactory),
    import('@/store/contracts/token').then((_) => _.useToken),
    import('@/store/contracts/bridge').then((_) => _.useBridge),
  ],
  {
    preserveConnection: true,
    updateOnChainChange: true,
    updateOnWalletChange: true,
    globalLoading: true,
  }
)
