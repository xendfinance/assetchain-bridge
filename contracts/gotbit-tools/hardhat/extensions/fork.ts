import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber, BigNumberish, ethers, Contract } from 'ethers'
import { extendEnvironment } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const ADD_COMPILATION_RESULT = 'hardhat_addCompilationResult'
const DROP_TRANSACTION = 'hardhat_dropTransaction'
const IMPERSONATE_ACCOUNT = 'hardhat_impersonateAccount'
const GET_AUTOMINE = 'hardhat_getAutomine'
const MINE = 'hardhat_mine'
const RESET = 'hardhat_reset'
const SET_BALANCE = 'hardhat_setBalance'
const SET_CODE = 'hardhat_setCode'
const SET_COINBASE = 'hardhat_setCoinbase'
const SET_LOGGING_ENABLED = 'hardhat_setLoggingEnabled'
const SET_MIN_GAS_PRICE = 'hardhat_setMinGasPrice'
const SET_NEXT_BLOCK_BASE_FEE_PER_GAS = 'hardhat_setNextBlockBaseFeePerGas'
const SET_NONCE = 'hardhat_setNonce'
const SET_STORAGE_AT = 'hardhat_setStorageAt'
const STOP_IMPERSONATING_ACCOUNT = 'hardhat_stopImpersonatingAccount'

export const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD'

export class ForkPlugin {
  hre: HardhatRuntimeEnvironment

  methods = {
    ADD_COMPILATION_RESULT,
    DROP_TRANSACTION,
    IMPERSONATE_ACCOUNT,
    GET_AUTOMINE,
    MINE,
    RESET,
    SET_BALANCE,
    SET_CODE,
    SET_COINBASE,
    SET_LOGGING_ENABLED,
    SET_MIN_GAS_PRICE,
    SET_NEXT_BLOCK_BASE_FEE_PER_GAS,
    SET_NONCE,
    SET_STORAGE_AT,
    STOP_IMPERSONATING_ACCOUNT,
  }

  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre
  }

  /**
   * Remove a transaction from the mempool
   */
  async dropTransaction(tx: string) {
    await this.hre.network.provider.request({
      method: this.methods.DROP_TRANSACTION,
      params: [tx],
    })
  }

  /** 
   *Writes a single position of an account's storage.

   *For example:

   *await network.provider.send("hardhat_setStorageAt", [
   *  "0x0d2026b3EE6eC71FC6746ADb6311F6d3Ba1C000B",
   *  "0x0",
   *  "0x0000000000000000000000000000000000000000000000000000000000000001",
   *]);
   *This will set the contract's first storage position (at index 0x0) to 1.

   *The mapping between a smart contract's variables and its storage position is not straightforward except in some very simple cases. For example, if you deploy this contract:

   *contract Foo {
   *  uint public x;
   *}
   *And you set the first storage position to 1 (as shown in the previous snippet), then calling foo.x() will return 1.

   *The storage position index must not exceed 2^256, and the value to write must be exactly 32 bytes long.
   */
  async setStorageAt(address: string, positing: string, value: string) {
    await this.hre.network.provider.request({
      method: this.methods.SET_STORAGE_AT,
      params: [address, positing, value],
    })
  }

  async impersonateAccount(address: string) {
    await this.hre.network.provider.request({
      method: this.methods.IMPERSONATE_ACCOUNT,
      params: [address],
    })
  }

  async setBalance(address: string, balance: BigNumber) {
    await this.hre.network.provider.request({
      method: this.methods.SET_BALANCE,
      params: [address, balance.toHexString().replace(/0x0+/, '0x')],
    })
  }

  utils = {
    getSigner: async (address: string): Promise<SignerWithAddress> => {
      await this.impersonateAccount(address)
      await this.setBalance(address, '100'.toBigNumber(18))
      return this.hre.ethers.getSigner(address)
    },

    getTokens: async (
      token: Contract,
      user: string,
      amount: BigNumberish
    ): Promise<boolean> => {
      const zeroAddress = await this.utils.getSigner(ethers.constants.AddressZero)
      if ((await token.balanceOf(zeroAddress.address)).gte(amount)) {
        await token.connect(zeroAddress).transfer(user, amount)
        return true
      }
      const deadAddress = await this.utils.getSigner(DEAD_ADDRESS)
      if ((await token.balanceOf(deadAddress.address)).gte(amount)) {
        await token.connect(deadAddress).transfer(user, amount)
        return true
      }
      return false
    },

    getTokensFrom: async (
      token: Contract,
      from: string,
      user: string,
      amount: BigNumberish
    ): Promise<boolean> => {
      const signer = await this.utils.getSigner(from)
      if ((await token.balanceOf(signer.address)).gte(amount)) {
        await token.connect(signer).transfer(user, amount)
        return true
      }
      return false
    },
  }
}

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    fork: ForkPlugin
  }
}

extendEnvironment((hre) => {
  hre.fork = new ForkPlugin(hre)
})
