import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgedAssetChainToken__factory, MultiSigWallet } from '@/typechain'
import { BigNumber } from 'ethers'

export const NAME = 'AssetToken'
export const SYMBOL = 'ASTKN'
export const DECIMALS = 18
export const TOTAL_SUPPLY = BigNumber.from(10).pow(9)
export const ORIGINAL_TOKEN = '0x0000000000000000000000000000000000000001'
export const ORIGINAL_CHAIN_ID = 1

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()

  const multiSigWallet = await ethers.getContract<MultiSigWallet>('MultiSigWallet')

  await deploy<BridgedAssetChainToken__factory>('BridgedAssetChainToken', {
    from: deployer.address,
    args: [
      'AssetToken',
      'ASTKN',
      18,
      BigNumber.from(10).pow(9),
      deployer.address,
      false,
      ORIGINAL_TOKEN,
      ORIGINAL_CHAIN_ID,
      multiSigWallet.address,
    ],
    log: true,
  })
}
export default func

func.tags = ['BridgedAssetChainToken.deploy']
