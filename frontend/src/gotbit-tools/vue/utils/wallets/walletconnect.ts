import type { providers } from 'ethers'

import {
  getChainHex,
  getChainRpc,
  getChainDescription,
  getChainName,
  getChainScanner,
} from '../info'
import type { ChainId } from '../types'
import { chainIds as allChainIds } from '../misc'

import type {
  ChangeChainCallbackFunction,
  ChangeWalletCallbackFunction,
  UpdateStoreStateFunction,
} from './types'

import { WalletHandler } from './types'

import WalletConnectProvider from '@walletconnect/web3-provider'
import { node } from '../node'
import { safe } from '../safe'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

export class Walletconnect extends WalletHandler {
  public appName!: string

  constructor(
    public chainIds: readonly ChainId[],
    public defaultChainId: ChainId,
    public updateStoreState: UpdateStoreStateFunction,
    public changeWalletCallback?: ChangeWalletCallbackFunction,
    public changeChainCallback?: ChangeChainCallbackFunction,
    public preventDefaultChangeWallet?: boolean,
    public preventDefaultChangeChain?: boolean,
  ) {
    super(
      chainIds,
      defaultChainId,
      updateStoreState,
      changeWalletCallback,
      changeChainCallback,
      preventDefaultChangeWallet,
      preventDefaultChangeChain,
    )
    this.initProvider()
  }

  async initProvider() {
    if (this.nativeProvider) return

    const rpc = {} as { [key: number]: string }

    for (const chainTag of Object.keys(allChainIds) as (keyof typeof allChainIds)[]) {
      const chainId =
        `${allChainIds[chainTag]}` as `${(typeof allChainIds)[typeof chainTag]}`
      rpc[parseInt(chainId)] = node(chainTag).rpc
    }

    this.nativeProvider = await EthereumProvider.init({
      projectId: '26e976b28693cb52ee780dd3f54307ac',
      showQrModal: true,
      rpcMap: rpc,
      chains: [parseInt(this.defaultChainId)],
    })
  }

  async connect(): Promise<boolean> {
    await this.initProvider()
    try {
      await this.nativeProvider.enable().catch(async (error: any) => {})
      console.log(this.nativeProvider)
      // this.appName = this.nativeProvider.wc._peerMeta.name
      await this.updateProviderState()

      if (!this.chainId) return false

      if (
        !(this.chainIds as string[]).includes(this.chainId) &&
        !this.preventDefaultChangeChain
      ) {
        await this.switchChain(this.defaultChainId)
      }

      this.nativeProvider.on('accountsChanged', this.changeWalletHanlder?.bind(this))
      this.nativeProvider.on('chainChanged', this.changeChainHandler?.bind(this))

      const disconnectHandler = async () => {
        if (!this.actual) return
        this.updateStoreState(null, '', this.defaultChainId, false)
        this.nativeProvider.on('disconnect', async () => await disconnectHandler())
      }

      this.nativeProvider.on('disconnect', async () => await disconnectHandler())
      return true
    } catch (error) {
      console.error(error)
      return false
    } finally {
    }
  }
  clear() {
    super.clear()
    this.nativeProvider.removeListener('disconnect', async () => {
      this.updateStoreState(null, '', this.defaultChainId, false)
    })
  }

  async switchChain(chainId: ChainId): Promise<boolean> {
    await this.initProvider()

    console.log('switch')
    if ((await this.getChainId()) === (chainId as string)) {
      console.log('here')
      return false
    }
    // if (this.appName.includes('Trust Wallet')) {
    //   return false
    // }

    console.log('Sending request to change chain')

    const [res, err] = await safe(
      this.nativeProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: getChainHex(chainId) }],
      }),
    )
    if (err) {
      const errorMessage = (err as any).message.replace(/ "[^]*"/, '')
      switch (errorMessage) {
        case 'User rejected the request.':
          return false
        case 'Unrecognized chain ID. Try adding the chain using wallet_addEthereumChain first.':
          await this.addChain(chainId)
          return true
      }
    }
    return true

    // return new Promise<string>(async (resolve, reject) => {
    //   // When succesful this request throw: Response data is invalid
    //   this.nativeProvider
    //     .request({
    //       method: 'wallet_switchEthereumChain',
    //       params: [{ chainId: getChainHex(chainId) }],
    //     })
    //     .catch(async (error: any) => {
    //       const errorMessage = error.message.replace(/ "[^]*"/, '')
    //       switch (errorMessage) {
    //         case 'User rejected the request.':
    //           resolve('User rejected chain')
    //           break
    //         case 'Unrecognized chain ID. Try adding the chain using wallet_addEthereumChain first.':
    //           await this.addChain(chainId)
    //           resolve('success')
    //       }
    //     })
    //   resolve('success')
    // })
  }
  async addChain(chainId: ChainId): Promise<boolean> {
    console.log('Add chain')
    await this.initProvider()

    try {
      const param = {
        chainId: getChainHex(chainId),
        chainName: getChainName(chainId),
        nativeCurrency: {
          name: getChainDescription(chainId).symbol,
          symbol: getChainDescription(chainId).symbol,
          decimals: 18,
        },
        rpcUrls: [getChainRpc(chainId)],
        blockExplorerUrls: getChainScanner(chainId) ? [getChainScanner(chainId)] : null,
      }
      const resp = await this.nativeProvider.request({
        method: 'wallet_addEthereumChain',
        params: [param],
      })
      console.log(resp)
      return true
    } catch (addError) {
      console.log(addError)
      return false
    }
  }

  async disconnect() {
    await this.initProvider()

    this.clear()
    await this.nativeProvider.disconnect()
    return true
  }

  async getSigner() {
    await this.initProvider()

    return this.provider?.getSigner() ?? null
  }

  async getAddress() {
    await this.initProvider()

    return (await this.getSigner())?.getAddress() ?? null
  }
}
