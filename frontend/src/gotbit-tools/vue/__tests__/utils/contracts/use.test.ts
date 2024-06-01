import { Contract, constants } from 'ethers'
import { Contract as MulticallContract } from 'ethers-multicall'

import { describe, expect, it, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { makePromise, initWeb3 } from '../../test-utils'
import {
  useContracts,
  call,
  multicall,
  isLogin,
  solError,
} from '../../../utils/contracts/use'
import { useWeb3 } from '../../../utils/stores/web3'
import { config, contracts } from '@/gotbit.config'

describe('`utils/contracts/use.ts` test', () => {
  describe('`useContracts` function', () => {
    beforeEach(() => {
      setActivePinia(createPinia())
    })
    it('should returns object with correct keys', () => {
      initWeb3()
      const offChain: string[] = Object.keys(contracts).filter(
        (n) => !config.chainIds.includes(n as any),
      )
      let onChain: string[] = []
      if (config.chainIds.length === 0) return
      for (const chainId of config.chainIds) {
        /// @ts-ignore
        onChain = [...onChain, ...Object.keys(contracts[chainId])]
      }

      const sharedContracts = useContracts()
      for (const offChainName of offChain) {
        expect(sharedContracts).toHaveProperty(offChainName)
        expect(sharedContracts).toHaveProperty('$' + offChainName)
      }
    })
  })
  describe('`isLogin` function', () => {
    beforeEach(() => {
      setActivePinia(createPinia())
    })
    it('should returns login status', () => {
      const web3 = useWeb3()
      expect(web3.login).eq(isLogin())
      web3.login = false
      expect(web3.login).eq(isLogin())
      web3.login = true
      expect(web3.login).eq(isLogin())
    })
  })
  describe('`call` function', () => {
    it('should returns correct object', () => {
      const callback = () => console.log('test')
      const promise = makePromise(true, null)
      const result = call<any>(promise, callback)

      expect(typeof result).eq('object')
      expect(result.call).eq(promise)
      expect(result.callback).eq(callback)
    })
  })
  describe('`multicall` function', () => {
    it('should returns correct object', () => {
      const address = constants.AddressZero
      const abi = [
        'function transfer(address from, address to, uint256 amount) external;',
      ]
      const contract = new Contract(address, abi)
      const multicallContract = multicall(contract)

      expect(multicallContract.address).eq(contract.address)
      expect(multicallContract instanceof MulticallContract).true
    })
  })
})
