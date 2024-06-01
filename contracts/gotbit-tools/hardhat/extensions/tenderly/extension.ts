import { BigNumberish, ethers } from 'ethers'
import { extendEnvironment } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const INCREASE_BLOCKS = 'evm_increaseBlocks'
const INCREASE_TIME = 'evm_increaseTime'
const SET_BALANCE = 'tenderly_setBalance'
const ADD_BALANCE = 'tenderly_addBalance'
const SET_STORAGE_AT = 'tenderly_setStorageAt'

export class TenderlyPlugin {
  hre: HardhatRuntimeEnvironment

  methods = {
    INCREASE_BLOCKS,
    INCREASE_TIME,
    SET_BALANCE,
    ADD_BALANCE,
    SET_STORAGE_AT,
  }

  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre
  }

  async increaseBlocks(blocks: number) {
    await this.hre.network.provider.request({
      method: this.methods.INCREASE_BLOCKS,
      params: [ethers.utils.hexValue(blocks)],
    })
  }
  async increaseTime(seconds: number) {
    await this.hre.network.provider.request({
      method: this.methods.INCREASE_TIME,
      params: [ethers.utils.hexValue(seconds)],
    })
  }
  async setBalance(wallets: string[], amount: BigNumberish) {
    await this.hre.network.provider.request({
      method: this.methods.SET_BALANCE,
      params: [wallets, ethers.utils.hexValue(amount)],
    })
  }
  async addBalance(wallets: string[], amount: BigNumberish) {
    await this.hre.network.provider.request({
      method: this.methods.ADD_BALANCE,
      params: [wallets, ethers.utils.hexValue(amount)],
    })
  }
  async setStorageAt(contract: string, slot: string, value: string) {
    await this.hre.network.provider.request({
      method: this.methods.SET_STORAGE_AT,
      params: [contract, slot, value],
    })
  }
}

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    tenderly: TenderlyPlugin
  }
}

extendEnvironment((hre) => {
  hre.tenderly = new TenderlyPlugin(hre)
})
