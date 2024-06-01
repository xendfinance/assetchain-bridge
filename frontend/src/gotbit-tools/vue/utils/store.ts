import type { _GettersTree } from 'pinia'

import type { IContractStoreDefinition, StoreLifecycle } from './stores/types/pure'
import type { IWeb3State } from './stores/types'
import type { ContractStoreImport } from './defines'

import { displayStore } from './misc'
import type { ChainId, WalletType } from '../types'

export async function load(
  store: IContractStoreDefinition,
  func: () => Promise<boolean>,
  lifecycle: StoreLifecycle,
) {
  if (!store().loading || lifecycle === 'onFinal') {
    displayStore(store.$id, 'loading', lifecycle)
    const response = await func()
    if (response) displayStore(store.$id, 'done', lifecycle)
    else displayStore(store.$id, 'problem', lifecycle)
  } else displayStore(store.$id, 'busy', lifecycle)
}

export const execLifecycle = async (
  registerContracts: ContractStoreImport[],
  lifecycle: StoreLifecycle,
) => {
  console.gotbit.group(`[${lifecycle} lifecycle]`)
  await Promise.all(
    registerContracts.map(async (store) => {
      const useStore = await store
      const lifecycleFunc = useStore()[lifecycle]
      if (lifecycleFunc) await load(useStore, lifecycleFunc, lifecycle)
    }),
  )
  console.groupEnd()
}

export async function initLifecycle(registerContracts: ContractStoreImport[]) {
  await execLifecycle(registerContracts, 'onInit')
}

export async function loginLifecycle(registerContracts: ContractStoreImport[]) {
  await execLifecycle(registerContracts, 'onLogin')
}

export async function finalLifecycle(registerContracts: ContractStoreImport[]) {
  await execLifecycle(registerContracts, 'onFinal')
}

export async function logoutLifecycle(registerContracts: ContractStoreImport[]) {
  await execLifecycle(registerContracts, 'onLogout')
}

export const web3Getters = {
  globalLoading: (state: IWeb3State) =>
    Object.values(state.storeLoadings).some((v) => v) || state.loading,
  loader: (state: IWeb3State) => state.loading,
  isCorrectChainId: (state: IWeb3State) =>
    state.chainIds.includes(state.realChainId as ChainId),
}

export async function manageLocalStorage(useStores: ContractStoreImport[]) {
  for (const useStore of useStores) {
    const store = (await useStore)()
    if (store.fromLocalStorage) {
      // restore from local storage
      const storage = localStorage.getItem(`dapp.${(await useStore).$id}`)
      if (storage) store.fromLocalStorage(JSON.parse(storage))
    }
    if (store.toLocalStorage) {
      // subscribe on stores update
      store.$subscribe(async () => {
        const store = (await useStore)()
        const storage = store.toLocalStorage?.()
        if (storage)
          localStorage.setItem(`dapp.${(await useStore).$id}`, JSON.stringify(storage))
      })
    }
  }
}

export async function manageSessionStorage(useStores: ContractStoreImport[]) {
  for (const useStore of useStores) {
    const store = (await useStore)()
    if (store.fromSessionStorage) {
      // restore from local storage
      const storage = sessionStorage.getItem(`dapp.${(await useStore).$id}`)
      if (storage) store.fromSessionStorage(JSON.parse(storage))
    }
    if (store.toSessionStorage) {
      // subscribe on stores update
      store.$subscribe(async () => {
        const store = (await useStore)()
        const storage = store.toSessionStorage?.()
        if (storage)
          sessionStorage.setItem(`dapp.${(await useStore).$id}`, JSON.stringify(storage))
      })
    }
  }
}

const CONNECT_WALLET_FIELD = 'connect.wallet'
type ConnectWalletField = {
  walletType?: WalletType
  autoConnect?: boolean
}

export const getPreservedConnection = (): WalletType | null => {
  const { walletType, autoConnect } = JSON.parse(
    localStorage.getItem(CONNECT_WALLET_FIELD) ?? '{}',
  ) as ConnectWalletField

  if (walletType && autoConnect) return walletType
  return null
}

export const setPreservedConnection = (
  walletType: WalletType | null,
  status: boolean,
) => {
  localStorage.setItem(
    CONNECT_WALLET_FIELD,
    JSON.stringify(<ConnectWalletField>{
      walletType,
      autoConnect: status,
    }),
  )
}
