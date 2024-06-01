import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useWeb3 } from '../utils/stores/web3'

import type { Bytes } from 'ethers'
import type { Ref } from 'vue'
import type { ChainId } from '../types'

/** Composable for web3 store
 * @param {string=} connectLabel - label for wallet before login
 * @returns {{
 *  wallet: Ref<string>,
 *  walletLabel: Ref<string>,
 *  login: Ref<boolean>,
 *  globalLoading: Ref<boolean>,
 *  chainId: Ref<ChainId>,
 *  connectMetamask: () => Promise<void>,
 *  connectCoinbase () => Promise<void>,
 *  connectWalletconnect () => Promise<void>,
 *  signMessage:(data: string | Bytes) => Promise<string | null>,
 *  disconnect: () => Promise<void>
 * }} wallet utils
 */
export const useWallet = (
  connectLabel = 'Connect',
): {
  wallet: Ref<string>
  walletLabel: Ref<string>
  login: Ref<boolean>
  globalLoading: Ref<boolean>
  chainId: Ref<ChainId>
  connectMetamask: () => Promise<void>
  connectCoinbase: () => Promise<void>
  connectWalletconnect(): Promise<void>
  connectTrustWallet(): Promise<void>
  connectOKXWallet(): Promise<void>
  connectMadWallet(): Promise<void>
  realChainId: Ref<string | null>
  connectNative(privateKey: string): Promise<void>
  signMessage: (data: string | Bytes) => Promise<string | null>
  disconnect: () => Promise<boolean>
} => {
  const web3 = useWeb3()
  const { wallet, login, globalLoading, chainId, realChainId } = storeToRefs(web3)

  const walletLabel = computed(() =>
    wallet.value ? wallet.value.shortAddress() : connectLabel,
  )

  return {
    realChainId,
    wallet,
    walletLabel,
    login,
    globalLoading,
    chainId,
    connectMetamask: async () => {
      if (window.ethereum) await web3.connect('metamask')
      else {
        const siteName = window.location.href
        const toDeepLink = (siteName: string) =>
          `https://metamask.app.link/dapp/${siteName}`
        window.open(toDeepLink(siteName))
      }
    },
    connectWalletconnect: () => web3.connect('walletconnect'),
    connectTrustWallet: () => web3.connect('trustwallet'),
    connectCoinbase: () => web3.connect('coinbase'),
    connectOKXWallet: () => web3.connect('okxwallet'),
    connectMadWallet: () => web3.connect('madwallet'),
    connectNative: (privateKey: string) =>
      web3.connect('native', undefined, undefined, privateKey),
    signMessage: web3.signMessage,
    disconnect: web3.disconnect,
  }
}
