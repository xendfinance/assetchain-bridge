import { providers, Wallet } from 'ethers'
import type { ChainId } from '../types'
import type { registerWallets } from '.'
import { ISigner } from '../../types'

export type ConnectFunction = (
  wallet: string,
  signer: ISigner,
  chainId: ChainId,
  login?: boolean,
) => Promise<void>

export type ChangeWalletCallbackFunction = (wallet: string) => void
export type ChangeChainCallbackFunction = (chainId: string) => void
export type WalletType = keyof typeof registerWallets

export type UpdateStoreStateFunction = (
  signer: ISigner,
  wallet: string | null,
  chainId: string | null,
  login?: boolean,
) => Promise<void>

export abstract class WalletHandler {
  public provider: providers.Web3Provider | providers.JsonRpcProvider | null = null
  public signer: ISigner = null
  public address: string | null = null
  public chainId: string | null = null
  public nativeProvider: any
  public actual = true

  constructor(
    public chainIds: readonly ChainId[],
    public defaultChainId: ChainId,
    public updateStoreState: UpdateStoreStateFunction,
    public changeWalletCallback?: ChangeWalletCallbackFunction,
    public changeChainCallback?: ChangeChainCallbackFunction,
    public preventDefaultChangeWallet?: boolean,
    public preventDefaultChangeChain?: boolean,
  ) {}

  abstract connect(): Promise<boolean>
  abstract disconnect(): Promise<boolean>
  abstract switchChain(chainId: ChainId): Promise<boolean>
  abstract addChain(chainId: ChainId): Promise<boolean>

  async updateProviderState() {
    this.provider = new providers.Web3Provider(this.nativeProvider)
    this.signer = await this.getSigner()
    this.address = await this.getAddress()
    this.chainId = await this.getChainId()
    await this.updateStoreState(this.signer, this.address, this.chainId)
  }

  async changeChainHandler(chainId: number) {
    if (!this.actual) return
    this.nativeProvider.once('chainChanged', this.changeChainHandler?.bind(this))
    chainId = parseInt(chainId.toString())

    if (this.chainId && parseInt(this.chainId) === chainId) return
    console.gotbit.log('change chain')

    if (!this.preventDefaultChangeChain) {
      // default behavior
      await this.updateProviderState()

      if (!this.chainIds.includes(chainId.toString() as ChainId))
        return await this.switchChain(this.defaultChainId)
    }
    this.changeChainCallback?.(chainId.toString())
  }

  async changeWalletHanlder(accounts: string[]) {
    if (!this.actual) return
    this.nativeProvider.once('accountsChanged', this.changeWalletHanlder?.bind(this))

    if (accounts[0] === this.address) return
    console.gotbit.log('change chain')

    if (!this.preventDefaultChangeWallet) {
      // default behavior
      await this.updateProviderState()
    }
    this.changeWalletCallback?.(accounts[0])
  }

  clear() {
    this.actual = false
  }

  async getSigner(): Promise<ISigner> {
    return this.provider?.getSigner() ?? null
  }

  async getChainId(): Promise<string | null> {
    return (await this.provider?.getNetwork())?.chainId.toString() ?? null
  }

  async getAddress(): Promise<string | null> {
    return (await this.getSigner())?.getAddress() ?? null
  }
}
