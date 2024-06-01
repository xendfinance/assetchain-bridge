import { Metamask } from './metamask'
import { Walletconnect } from './walletconnect'
import { CoinBase } from './coinbase'
import { Native } from './native'
import { TrustWallet } from './trustwallet'
import { OKXWallet } from './okxwallet'
import { MadWallet } from './madwallet'

export const registerWallets = {
  metamask: Metamask,
  walletconnect: Walletconnect,
  coinbase: CoinBase,
  native: Native,
  trustwallet: TrustWallet,
  okxwallet: OKXWallet,
  madwallet: MadWallet,
}

export default { Metamask, Walletconnect, CoinBase, Native, TrustWallet, OKXWallet, MadWallet }
