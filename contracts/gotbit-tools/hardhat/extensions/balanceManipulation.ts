import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { extendEnvironment } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

export class balanceManipulation {
  hre: HardhatRuntimeEnvironment
  slots: { [address: string]: number }

  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre
    this.slots = {
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': 3,
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': 1,
      '0x55d398326f99059fF775485246999027B3197955': 1,
    }
  }

  async toBytes32(bn: BigNumber): Promise<string> {
    return this.hre.ethers.utils.hexlify(
      this.hre.ethers.utils.zeroPad(bn.toHexString(), 32)
    )
  }

  async setStorageAt(address: string, index: string, value: string) {
    await this.hre.ethers.provider.send('hardhat_setStorageAt', [address, index, value])
    await this.hre.ethers.provider.send('evm_mine', [])
  }

  async setBalance(
    tokenAddress: string,
    beneficiary: string,
    amount: BigNumberish,
    slot?: number
  ) {
    if (slot === undefined) {
      slot = this.slots[tokenAddress]
      if (slot === undefined) {
        throw new Error(
          'Slot for this Token is not known. You can specify slot directly via slot parameter'
        )
      }
    }
    const index = this.hre.ethers.utils
      .solidityKeccak256(['uint256', 'uint256'], [beneficiary, slot])
      .replace(/0x0+/, '0x')
    await this.setStorageAt(
      tokenAddress,
      index,
      (await this.toBytes32(BigNumber.from(amount))).toString()
    )
  }
}

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    balanceManipulation: balanceManipulation
  }
}

extendEnvironment((hre) => {
  hre.balanceManipulation = new balanceManipulation(hre)
})
