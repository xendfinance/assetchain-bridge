import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import { CHAIN_IDS } from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgeAssistTransferUpgradeable__factory } from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  if (chainId == CHAIN_IDS.assetChain) {
    return
  }

  await deploy<BridgeAssistTransferUpgradeable__factory>('BridgeAssistTransferUpgradeable', {
    contract: 'BridgeAssistTransferUpgradeable',
    from: deployer.address,
    args: [],
    proxy: {
      owner: deployer.address,
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        methodName: 'initialize',
        args: [
          '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
          100000000,
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

func.tags = ['BridgeAssistTransferUpgradeable.deploy']
