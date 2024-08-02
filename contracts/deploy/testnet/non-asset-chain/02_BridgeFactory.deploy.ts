import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import { CHAIN_IDS } from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type {
  BridgeAssistTransferUpgradeable,
  BridgeFactoryUpgradeable__factory,
  MultiSigWallet,
} from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  if (chainId == CHAIN_IDS.assetChain) {
    return
  }

  const bridgeTransfer = await ethers.getContract<BridgeAssistTransferUpgradeable>(
    'BridgeAssistTransferUpgradeable'
  )
  const mulsigwallet = await ethers.getContract<MultiSigWallet>('MultiSigWallet')

  await deploy<BridgeFactoryUpgradeable__factory>('BridgeFactoryUpgradeable', {
    contract: 'BridgeFactoryUpgradeable',
    from: deployer.address,
    proxy: {
      owner: deployer.address,
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        methodName: 'initialize',
        args: [
          bridgeTransfer.address,
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          mulsigwallet.address,
          deployer.address,
        ],
      },
    },
    log: true,
  })
}
export default func

func.tags = ['BridgeFactoryUpgradeable.deploy']
func.dependencies = ['BridgeAssistTransferUpgradeable.deploy']
func.dependencies = ['MultiSigWallet.deploy']
