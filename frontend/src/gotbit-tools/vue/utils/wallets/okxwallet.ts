import { config } from '@/gotbit.config'
import { getChainHex, getChainDescription, getChainName, getChainScanner } from '../info'
import type { ChainId } from '../types'
import type {
  ChangeChainCallbackFunction,
  ChangeWalletCallbackFunction,
  UpdateStoreStateFunction,
} from './types'

import { WalletHandler } from './types'
export class OKXWallet extends WalletHandler {
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
    const ehtProvider = (window as any).okxwallet

    if (ehtProvider && ehtProvider.providers)
      this.nativeProvider = ehtProvider.providers.find(
        (provider: any) => provider.isOkxWallet,
      )
    else this.nativeProvider = ehtProvider

    console.log(this.nativeProvider, 'provider')

    if (!this.nativeProvider) {
      alert('Please set up Okx Wallet properly')
      throw new Error('Please set up Okx Wallet properly')
    }

    this.nativeProvider.on('accountsChanged', this.changeWalletHanlder?.bind(this))
    this.nativeProvider.on('chainChanged', this.changeChainHandler?.bind(this))
  }

  async connect(): Promise<boolean> {
    try {
      this.address = (
        await this.nativeProvider.request({ method: 'eth_requestAccounts' })
      )[0] as string
      await this.updateProviderState()

      if (!this.chainId) return false

      if (
        !(this.chainIds as string[]).includes(this.chainId) &&
        !this.preventDefaultChangeChain
      ) {
        await this.switchChain(this.defaultChainId)
      }

      return true
    } catch (error) {
      if (+(error as any).code == 4001) {
        alert('Please connect to Okx Wallet.')
      } else {
        alert('Please connect to Okx Wallet.')
        console.error(error)
      }
      return false
    }
  }

  async switchChain(chainId: ChainId): Promise<boolean> {
    try {
      await this.nativeProvider.request?.({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: getChainHex(chainId) }],
      })
      await this.updateProviderState()
      return true
    } catch (error) {
      if (parseInt((error as any).code) == 4902) return await this.addChain(chainId)
    }
    return false
  }

  async addChain(chainId: ChainId): Promise<boolean> {
    try {
      const param = {
        chainId: getChainHex(chainId),
        chainName: getChainName(chainId),
        nativeCurrency: {
          name: getChainDescription(chainId).symbol,
          symbol: getChainDescription(chainId).symbol,
          decimals: 18,
        },
        rpcUrls: [getChainDescription(chainId).rpc],
        blockExplorerUrls: getChainScanner(chainId) ? [getChainScanner(chainId)] : null,
      }
      await this.nativeProvider.request?.({
        method: 'wallet_addEthereumChain',
        params: [param],
      })
      return true
    } catch (addError) {
      return false
    }
  }

  async disconnect(): Promise<boolean> {
    this.clear()
    return true
  }
}
