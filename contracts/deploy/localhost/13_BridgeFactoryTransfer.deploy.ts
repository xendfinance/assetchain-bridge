import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type {
  BridgeAssistTransferUpgradeable,
  BridgeAssistNativeUpgradeable,
  BridgeAssistMintUpgradeable,
  BridgeFactoryUpgradeable__factory,
  BridgeAssistCircleMintUpgradeable,
  MultiSigWallet,
} from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()

  const bridgeAssistTransfer = await ethers.getContract<BridgeAssistTransferUpgradeable>(
    'BridgeAssistTransferUpgradeable'
  )
  const bridgeAssistMint = await ethers.getContract<BridgeAssistMintUpgradeable>('BridgeAssistMintUpgradeable')
  const bridgeAssistNative = await ethers.getContract<BridgeAssistNativeUpgradeable>(
    'BridgeAssistNativeUpgradeable'
  )
  const bridgeAssistCircleMint = await ethers.getContract<BridgeAssistCircleMintUpgradeable>('BridgeAssistCircleMintUpgradeable')
  const multiSigWallet = await ethers.getContract<MultiSigWallet>('MultiSigWallet')

  await deploy<BridgeFactoryUpgradeable__factory>('BridgeFactoryUpgradeable', {
    from: deployer.address,
    proxy: {
      owner: deployer.address,
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        methodName: 'initialize',
        args: [
          bridgeAssistTransfer.address,
          bridgeAssistMint.address,
          bridgeAssistNative.address,
          bridgeAssistCircleMint.address,
          multiSigWallet.address,
          deployer.address,
        ],
      },
    },
    log: true,
  })
}
export default func

func.tags = ['BridgeFactoryUpgradeable.deploy']
func.dependencies = [
  'BridgeAssistTransferUpgradeable.deploy',
  'BridgeAssistMintUpgradeable.deploy',
  'BridgeAssistNativeUpgradeable.deploy',
  'BridgeAssistCircleMintUpgradeable.deploy',
  'MultiSigWallet.deploy'
]
