import CoinbaseWalletSDK from '@coinbase/wallet-sdk'

import { WalletHandler } from './types'
import type {
  ChangeChainCallbackFunction,
  ChangeWalletCallbackFunction,
  UpdateStoreStateFunction,
} from './types'
import {
  getChainHex,
  getChainRpc,
  getChainDescription,
  getChainName,
  getChainScanner,
} from '../info'

import type { ChainId } from '../types'

export class CoinBase extends WalletHandler {
  public coinbaseWallet!: any

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
    this.coinbaseWallet = new CoinbaseWalletSDK({
      appName: 'CoinBase',
      appLogoUrl: 'https://example.com/logo.png',
      darkMode: true,
    })
    this.nativeProvider = this.coinbaseWallet.makeWeb3Provider(
      getChainRpc(defaultChainId),
      defaultChainId,
    )
    if (this.defaultChainId)
      this.nativeProvider = this.coinbaseWallet.makeWeb3Provider(
        getChainRpc(defaultChainId),
        defaultChainId,
      )

    this.nativeProvider.once('accountsChanged', this.changeWalletHanlder?.bind(this))
    this.nativeProvider.once('chainChanged', this.changeChainHandler?.bind(this))
  }

  async connect(): Promise<boolean> {
    try {
      await this.nativeProvider.enable().catch(async (error: any) => {})
      await this.updateProviderState()

      if (!this.chainId) return false

      if (
        !(this.chainIds as string[]).includes(this.chainId) &&
        !this.preventDefaultChangeChain
      )
        await this.switchChain(this.defaultChainId)

      return true
    } catch (error) {
      console.error('Error in connect')
      return false
    }
  }

  async switchChain(chainId: ChainId): Promise<boolean> {
    try {
      const result = await this.nativeProvider.send('wallet_switchEthereumChain', [
        { chainId: getChainHex(chainId) },
      ])
      return true
    } catch (error) {
      if (+(error as any).code == 4902) {
        try {
          await this.nativeProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: getChainHex(chainId),
                rpcUrls: [getChainDescription(chainId).rpc],
                chainName: getChainName(chainId),
                nativeCurrency: {
                  name: getChainDescription(chainId).symbol,
                  decimals: 18,
                  symbol: getChainDescription(chainId).symbol,
                },
                blockExplorerUrls: getChainScanner(chainId)
                  ? [getChainScanner(chainId)]
                  : null,
              },
            ],
          })
          return true
        } catch (error) {
          console.error('Error in switchChain')
          return false
        }
      }
      return true
    }
  }

  async addChain(chainId: string): Promise<boolean> {
    return false
  }

  async disconnect(): Promise<boolean> {
    this.clear()
    try {
      this.coinbaseWallet.disconnect()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }
}
