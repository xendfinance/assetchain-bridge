import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import { CHAIN_IDS } from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgeAssistNativeUpgradeable__factory } from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  await deploy<BridgeAssistNativeUpgradeable__factory>('BridgeAssistNativeUpgradeable', {
    contract: 'BridgeAssistNativeUpgradeable',
    from: deployer.address,
    args: [],
    proxy: {
        owner: deployer.address,
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        methodName: 'initialize',
        args: [
          '0x0000000000000000000000000000000000000001',
          ethers.utils.parseEther('1'),
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

func.tags = ['BridgeAssistNativeUpgradeable.deploy']
