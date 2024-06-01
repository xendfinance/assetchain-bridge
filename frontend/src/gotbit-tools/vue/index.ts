import { safe, safeRead, safeWrite } from './utils/safe'
export { safe, safeRead, safeWrite }

import { defineConfig, displayStore, chainIds } from './utils/misc'
export { defineConfig, displayStore, chainIds }

import { Address, address } from './utils/address'
export { Address, address }

import {
  getContracts,
  debugInfo,
  debugOn,
  isFork,
  filterTransaction,
  filterCustomEvent,
} from './utils/dev'
export { getContracts, debugInfo, debugOn, isFork, filterTransaction, filterCustomEvent }

import { types, names, symbols, scanners, node, getConfig } from './utils/node'
export { types, names, symbols, scanners, node, getConfig }

import {
  getChainTag,
  getChainRpc,
  getChainName,
  getChainHex,
  getChainScanner,
  getProvider,
  getContractsInfo,
  getChainDescription,
  scannersLink,
} from './utils/info'
export {
  getChainTag,
  getChainRpc,
  getChainName,
  getChainHex,
  getChainScanner,
  getProvider,
  getContractsInfo,
  getChainDescription,
  scannersLink,
}

import wallets, { registerWallets } from './utils/wallets'
export { wallets, registerWallets }

import {
  load,
  initLifecycle,
  loginLifecycle,
  finalLifecycle,
  web3Getters,
} from './utils/store'
export { load, initLifecycle, loginLifecycle, finalLifecycle, web3Getters }

import { useWeb3 } from './utils/stores/web3'
export { useWeb3 }

import { useEvent } from './utils/stores/event'
export { useEvent }

import { useMulticall } from './utils/stores/multicall'
export { useMulticall }

import { MulticallWorker } from './utils/multicall'
export { MulticallWorker }

import { useContracts, isLogin, multicall, call, solError } from './utils/contracts/use'
export { useContracts, isLogin, multicall, call, solError }

import { mapContractSafe } from './utils/contracts/map'
export { mapContractSafe }

import ContractsInfo from './components/ContractsInfo.vue'
import KeyHandler from './components/KeyHandler.vue'
import ForkWallet from './components/ForkWallet.vue'
import { useWallet } from './composables/wallet'

const contractsInfoPath = {
  path: '/contracts-info',
  name: 'contracts-info',
  component: ContractsInfo,
}

export { ContractsInfo, KeyHandler, ForkWallet, contractsInfoPath, useWallet }
