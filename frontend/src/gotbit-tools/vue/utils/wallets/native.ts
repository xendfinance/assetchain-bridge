import { config } from '@/gotbit.config'
import { JsonRpcSigner } from '@ethersproject/providers'
import { Wallet } from 'ethers'
import {
  getChainHex,
  getChainDescription,
  getChainName,
  getChainScanner,
  getProvider,
} from '../info'
import type { ChainId } from '../types'
import type {
  ChangeChainCallbackFunction,
  ChangeWalletCallbackFunction,
  UpdateStoreStateFunction,
} from './types'

import { WalletHandler } from './types'

export class Native extends WalletHandler {
  public privateKey: string | null = null
  public wallet: Wallet | null = null

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
  }

  initPrivateKey(privateKey: string) {
    this.privateKey = privateKey
  }

  async connect(): Promise<boolean> {
    if (!this.privateKey) {
      console.gotbit.error('Null privateKey')
      return false
    }

    try {
      this.wallet = new Wallet(this.privateKey, getProvider(this.defaultChainId))
      this.address = this.wallet.address

      await this.updateProviderState()

      return true
    } catch (error) {
      console.gotbit.error(`Bad privateKey: ${this.privateKey}`)
      console.gotbit.error(error)
      return false
    }
  }

  async switchChain(chainId: ChainId): Promise<boolean> {
    if (!this.wallet) return false
    this.wallet = this.wallet.connect(getProvider(chainId))
    return true
  }

  async addChain(chainId: ChainId): Promise<boolean> {
    return true
  }

  async disconnect(): Promise<boolean> {
    this.clear()
    return true
  }

  async getSigner() {
    return this.wallet!
  }

  async getChainId() {
    return (await this.wallet?.provider?.getNetwork())?.chainId.toString()!
  }

  async getAddress() {
    return this.wallet?.address!
  }
}
