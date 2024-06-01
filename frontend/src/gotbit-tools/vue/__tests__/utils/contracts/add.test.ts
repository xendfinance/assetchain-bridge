import { describe, it, expect } from 'vitest'
import { Contract, constants } from 'ethers'
import { Interface } from '@ethersproject/abi'

import { config } from '@/gotbit.config'
import { addContractI, addContractWithAddressI } from '../../../utils/contracts/add'
import { getContractsInfo } from '../../../utils/info'

describe('`utils/contracts/add.ts` test', () => {
  describe('`addContractI` tests', () => {
    it('should returns contract function', async () => {
      const chainId = config.DEFAULT_CHAINID
      const contracts = getContractsInfo(chainId)
      if (!contracts) return

      const names = Object.keys(contracts) as (keyof typeof contracts)[]

      for (const name of names) {
        const address = contracts[name].address
        const iface = new Interface(contracts[name].abi)

        const contractFunction = addContractI(name)
        const contract = contractFunction(chainId)

        expect(typeof contractFunction).eq('function')
        expect(contract instanceof Contract).true
        expect(contract.address).eq(address)
        expect((contract.provider as any)._network.chainId).eq(parseInt(chainId))
        expect(iface.format('json')).eq(contract.interface.format('json'))
      }
    })
  })
  describe('`addContractWithAddressI` tests', () => {
    it('should returns contract function', async () => {
      const chainId = config.DEFAULT_CHAINID
      const contracts = getContractsInfo(chainId)
      if (!contracts) return

      const names = Object.keys(contracts) as (keyof typeof contracts)[]

      for (const name of names) {
        const fakeAddress = constants.AddressZero
        const iface = new Interface(contracts[name].abi)

        const contractFunction = addContractWithAddressI(name)
        const contractAddress = contractFunction(chainId)
        const contract = contractAddress(fakeAddress)

        expect(typeof contractFunction).eq('function')
        expect(typeof contractAddress).eq('function')
        expect(contract instanceof Contract).true
        expect(contract.address).eq(fakeAddress)
        expect((contract.provider as any)._network.chainId).eq(parseInt(chainId))
        expect(iface.format('json')).eq(contract.interface.format('json'))
      }
    })
  })
})
