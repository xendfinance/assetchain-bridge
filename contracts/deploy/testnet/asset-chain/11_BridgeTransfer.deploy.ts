import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import { CHAIN_IDS } from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgeAssistTransferUpgradeable__factory } from '@/typechain'
import { DEFAULT_LIMIT_PER_SEND } from '@/test/utils/constants'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

//   if (chainId == CHAIN_IDS.assetChain) {
//     return
//   }

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
          '0xc53eb7797Ab27bFbdCa418665fd07665839B2a1d',
          DEFAULT_LIMIT_PER_SEND,
          deployer.address,
          0,
          0,
          deployer.address,
          [deployer.address],
          1
        ],
      },
    },
    log: true,
  })
}
export default func

func.tags = ['BridgeAssistTransferUpgradeable.deploy']
