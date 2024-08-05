import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import { CHAIN_IDS } from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgeAssistMintUpgradeable__factory } from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  if (chainId != CHAIN_IDS.assetChain) {
    return
  }

  await deploy<BridgeAssistMintUpgradeable__factory>('BridgeAssistMintUpgradeable', {
    contract: 'BridgeAssistMintUpgradeable',
    from: deployer.address,
    args: [],
    proxy: {
      owner: deployer.address,
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        methodName: 'initialize',
        args: [
          '0xd3eA0B04FBCCD7B616f5E6c2EAe208ba15C510A1',
          ethers.utils.parseEther('100'),
          deployer.address,
          0,
          0,
          deployer.address,
          [deployer.address],
          1,
        ],
      },
    },
    log: true,
  })
}
export default func

func.tags = ['BridgeAssistMintUpgradeable.deploy']
