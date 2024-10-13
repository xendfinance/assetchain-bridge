import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import { CHAIN_IDS, MAINNET_CHAIN_IDS } from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgeAssistTransferUpgradeable__factory } from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  if (chainId != MAINNET_CHAIN_IDS.assetChain) {
    return
  }

  await deploy<BridgeAssistTransferUpgradeable__factory>('BridgeAssistTransferUpgradeable', {
    contract: 'BridgeAssistTransferUpgradeable',
    from: deployer.address,
    args: [],
    log: true,
  })
}
export default func

func.tags = ['BridgeAssistTransferUpgradeable.deploy']
