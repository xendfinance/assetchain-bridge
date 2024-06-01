import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { Token__factory } from '@/typechain'
import { BigNumber } from 'ethers'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()

  await deploy<Token__factory>('Token', {
    from: deployer.address,
    args: ['Token', 'TKN', 18, BigNumber.from(10).pow(9)],
    log: true,
  })
}
export default func

func.tags = ['Token.deploy']
