import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { MockNativeBridge__factory } from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()

  await deploy<MockNativeBridge__factory>('MockNativeBridge', {
    from: deployer.address,
    args: [],
    estimateGasExtra: 120_000, // strings.toString is not estimated properly
    log: true,
  })
}
export default func

func.tags = ['MockNativeBridge.deploy']
