import { expect, describe, it, beforeEach } from 'vitest'
import { constants } from 'ethers'
import { createPinia, setActivePinia } from 'pinia'
import { initWeb3 } from '../test-utils'
import { useWeb3 } from '../../utils/stores/web3'
import { useWallet } from '../../composables/wallet'
import { isRef } from 'vue'
import { config } from '@/gotbit.config'

describe('`componsables/wallet.ts` test', () => {
  describe('`useWallet` function', () => {
    beforeEach(() => {
      setActivePinia(createPinia())
    })
    it('should return correct wallet', () => {
      initWeb3()
      const web3 = useWeb3()

      const { wallet } = useWallet()
      expect(isRef(wallet)).true

      expect(web3.wallet).eq(wallet.value)

      const address = constants.AddressZero
      web3.testLogin(address)
      expect(address).eq(wallet.value)
    })
    it('should return correct walletLabel', () => {
      initWeb3()
      const web3 = useWeb3()

      const { walletLabel } = useWallet()
      expect(isRef(walletLabel)).true

      const address = constants.AddressZero
      web3.testLogin(address)
      expect(walletLabel.value).eq('0x0000...0000')
    })
    it('should return correct login', () => {
      initWeb3()
      const web3 = useWeb3()

      const { login } = useWallet()
      expect(isRef(login)).true
      expect(login.value).false

      const address = constants.AddressZero
      web3.testLogin(address)
      expect(login.value).true
    })
    it('should return correct globalLoading', () => {
      initWeb3()
      const web3 = useWeb3()

      const { globalLoading } = useWallet()
      expect(isRef(globalLoading)).true
      expect(globalLoading.value).false

      web3.loading = true
      expect(globalLoading.value).true
    })
    it('should return correct chainId', () => {
      initWeb3()
      const web3 = useWeb3()

      const { chainId } = useWallet()
      expect(isRef(chainId)).true
      expect(chainId.value).eq(config.DEFAULT_CHAINID)
    })
    it.todo('should connect to metamask')
    it.todo('should connect to walletconnect')
    it.todo('should sign message')
    it.todo('should disconnect')
  })
})
