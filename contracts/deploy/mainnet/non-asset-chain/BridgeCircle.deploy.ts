import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import { CHAIN_IDS } from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgeAssistCircleMintUpgradeable__factory } from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  if (chainId != CHAIN_IDS.assetChain) {
    return
  }

  await deploy<BridgeAssistCircleMintUpgradeable__factory>(
    'BridgeAssistCircleMintUpgradeable',
    {
      contract: 'BridgeAssistCircleMintUpgradeable',
      from: deployer.address,
      args: [],
      log: true,
    }
  )
}
export default func

func.tags = ['BridgeAssistCircleMintUpgradeable.deploy']
// func.dependencies = ['MultiSigWallet.deploy']
