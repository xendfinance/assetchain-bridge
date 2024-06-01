import { VoidSigner } from 'ethers'
import { defineStore } from 'pinia'
import { markRaw } from 'vue'

import type { Bytes } from 'ethers'

import {
  web3Getters,
  manageLocalStorage,
  manageSessionStorage,
  getPreservedConnection,
  setPreservedConnection,
  execLifecycle,
  load,
} from '../store'
import { registerWallets } from '../wallets'
import { safeRead } from '../safe'

import { ISigner, storeLifecycles } from './types/pure'
import type { ChainId } from '../types'
import type { WalletHandler, WalletType } from '../wallets/types'
import type { GotBitConfig } from '../misc'
import type { StoreSettings } from '../defines'

import { getProvider } from '../info'

import { useMulticall } from './multicall'

import * as settings from '@/gotbit.config'
import { checkRpc } from '../rpc/checker'
import { toBeforeEvent, useEvent } from './event'
import { Native } from '../wallets/native'

let storeSettings: StoreSettings = {
  stores: [],
}

let config = {
  DEBUG: true,
  chainIds: [] as any,
  DEFAULT_CHAINID: '' as any,
  rpc: () => '',
} as GotBitConfig<any>

if (!import.meta.env.VITE_OFF_STORE) {
  storeSettings = settings.storeSettings
  //@ts-ignore
  config = settings.config
}
export const useWeb3 = defineStore('$web3', {
  state: () => {
    return {
      wallet: '',
      signer: null as ISigner,
      chainId: config.DEFAULT_CHAINID as ChainId,
      realChainId: null as string | null,
      chainIds: config.chainIds as ChainId[],
      DEFAULT_CHAINID: config.DEFAULT_CHAINID as ChainId,
      preserveConnection: Boolean(storeSettings.options?.preserveConnection),
      login: false,
      loading: false,
      walletType: null as WalletType | null,
      walletHandler: null as WalletHandler | null,
      storeSettings: markRaw(storeSettings),
      storeLoadings: {} as Record<string, boolean>,

      _loading: false,
      _resolve: null as any,
      _awaiter: null as any,
      _loadingRequest: false,

      _initied: false,
    }
  },
  getters: {
    ...web3Getters,
  },
  actions: {
    async pretend(address: string, chainId?: ChainId) {
      if (chainId === undefined) chainId = this.DEFAULT_CHAINID
      const signer = new VoidSigner(address, getProvider(chainId))
      signer.sendTransaction = async (e: any) =>
        console.gotbit.error(JSON.stringify(e, undefined, 2)) as any
      await this.updateStoreState(signer, address, chainId)
      this.login = true
      await this.loadAll({ login: true })
    },
    testLogin(address: string, chainId?: ChainId) {
      console.gotbit.log(`Test login ${address} on ${chainId}`)

      if (chainId === undefined) chainId = this.DEFAULT_CHAINID
      const signer = new VoidSigner(address, getProvider(chainId))

      this.wallet = address
      this.signer = markRaw(signer)
      this.chainId = chainId
      this.login = true
    },
    processLoading(storeName: string, loading: boolean) {
      this.storeLoadings[storeName] = loading
    },
    async init(chainId?: ChainId, force?: boolean) {
      if (this._initied && !force) return
      // const checkpoints = config.checkpoints
      // if (checkpoints) {
      //   const chainTag = getChainTag(toRealChainIds(this.chainId))
      //   const checkpoint = checkpoints[chainTag as RemoteChainTag]
      //   console.log({ checkpoint })
      // }

      await checkRpc()

      const event = useEvent()

      for (const lifecycle of storeLifecycles) {
        event.addListener(toBeforeEvent(lifecycle), async () => {
          console.gotbit.group(lifecycle)
          // const lifecycleFunc = useStore()[lifecycle]
          // if (lifecycleFunc) await load(useStore, lifecycleFunc, lifecycle)
        })
      }

      for (const useStorePromise of this.storeSettings.stores) {
        const useStore = await useStorePromise
        const store = useStore()
        store.$subscribe(() => {
          const store = useStore()
          this.processLoading(useStore.$id, store.loading)
        })
        for (const lifecycle of storeLifecycles) {
          event.addListener(toBeforeEvent(lifecycle), async () => {
            const lifecycleFunc = useStore()[lifecycle]
            if (lifecycleFunc) await load(useStore, lifecycleFunc, lifecycle)
          })
        }
      }

      for (const lifecycle of storeLifecycles) {
        event.addListener(toBeforeEvent(lifecycle), async () => {
          console.gotbit.groupEnd()
          // const lifecycleFunc = useStore()[lifecycle]
          // if (lifecycleFunc) await load(useStore, lifecycleFunc, lifecycle)
        })
      }

      window.pretend = (address: string, chainId?: string) =>
        this.pretend(address, chainId as ChainId)

      // loading local and session storage
      manageLocalStorage(this.storeSettings.stores)
      manageSessionStorage(this.storeSettings.stores)

      if (this.preserveConnection)
        await this.connect(getPreservedConnection(), true, chainId)
      else {
        this.chainId = chainId ?? this.chainId
        await this.loadAll({ init: true })
      }

      this._initied = true
    },
    async loadAll(options?: { init?: boolean; login?: boolean }) {
      if (this._loading) {
        this._loadingRequest = true
        await this._awaiter
        this._loadingRequest = false
      }

      this._awaiter = new Promise((resolve) => (this._resolve = resolve))
      useMulticall().reset()
      this._loading = true
      await this._loadAll(options)
      this._loading = false
    },
    async _loadAll(options?: { init?: boolean; login?: boolean }) {
      if (storeSettings.options?.globalLoading) this.loading = true
      if (!options) options = { init: true, login: true }

      if (options.init) await this.initLifecycle()
      if (this._breakOut()) return

      if (this.login && options.login) await this.loginLifecycle()
      if (this._breakOut()) return

      await useMulticall().fulfillCalls()
      if (this._breakOut()) return

      await this.finalLifecycle()
      if (this._breakOut()) return

      if (storeSettings.options?.globalLoading) this.loading = false
    },
    _breakOut() {
      if (this._loadingRequest && this._resolve) {
        this._resolve()
        return true
      }
      return false
    },
    async initLifecycle() {
      await useEvent().emit('onInit', {})
    },
    async loginLifecycle() {
      await useEvent().emit('onLogin', {})
    },
    async finalLifecycle() {
      await useEvent().emit('onFinal', {})
    },

    async updateStoreState(
      signer: ISigner,
      wallet: string | null,
      chainId: string | null,
      login = true,
    ) {
      if (!wallet || !chainId) return

      if (this.preserveConnection) setPreservedConnection(this.walletType, login)

      if (signer) this.signer = markRaw(signer)
      else this.signer = null

      this.wallet = wallet
      this.realChainId = chainId

      if (this.chainIds.includes(chainId as ChainId)) this.chainId = chainId as ChainId
      else useEvent().emit('errorChainId', { chainId })

      this.login = login
    },

    async connect(
      walletType: WalletType | null,
      init = false,
      chainId?: ChainId,
      privateKey?: string,
    ) {
      if (!walletType) {
        await this.loadAll({ init: true })
        return
      }

      this.walletHandler?.clear()

      this.walletHandler = markRaw(
        new registerWallets[walletType](
          config.chainIds,
          this.chainId,
          this.updateStoreState,
          (wallet) => {
            useEvent().emit('onWalletChange', { wallet })
            if (storeSettings.options?.updateOnWalletChange) this.loadAll({ login: true })
          },
          (chainId) => {
            useEvent().emit('onChainChange', { chainId, natural: true })
            if (storeSettings.options?.updateOnChainChange)
              this.loadAll({ init: true, login: true })
          },
          storeSettings.options?.preventDefaultChangeWallet,
          storeSettings.options?.preventDefaultChangeChain,
        ),
      )
      this.walletType = walletType

      if (this.walletType === 'native') {
        ;(this.walletHandler as Native).initPrivateKey(privateKey ?? '')
      }

      if (!(await this.walletHandler?.connect())) return
      this.chainId = chainId ?? this.chainId
      await this.loadAll({ init, login: true })
    },
    async signMessage(data: string | Bytes): Promise<string | null> {
      if (this.login) {
        const signedMessage = await safeRead<string | null>(
          this.signer!.signMessage(data),
          null,
        )
        return signedMessage
      }
      return null
    },
    async switchChain(chainId: ChainId): Promise<boolean> {
      const result = Boolean(await this.walletHandler?.switchChain(chainId))
      if (result) useEvent().emit('onChainChange', { chainId, natural: false })
      return result
    },
    async disconnect(): Promise<boolean> {
      await useEvent()._emit('beforeOnLogout', {})
      this.login = false
      this.wallet = ''
      await useEvent()._emit('onLogout', {})

      setPreservedConnection(this.walletType, false)

      await useEvent()._emit('afterOnLogout', {})
      return Boolean(await this.walletHandler?.disconnect())
    },
  },
})
