import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import { CHAIN_IDS, MAINNET_CHAIN_IDS, MULTISIG_ADDRESSES } from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type {
  BridgeAssistCircleMintUpgradeable,
  BridgeAssistMintUpgradeable,
  BridgeAssistNativeUpgradeable,
  BridgeAssistTransferUpgradeable,
  BridgeFactoryUpgradeable__factory,
  MultiSigWallet,
} from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()
  console.log(`ChainId ${chainId}`)
  const bridgeMint = await ethers.getContract<BridgeAssistMintUpgradeable>(
    'BridgeAssistMintUpgradeable'
  )
  const bridgeNative = await ethers.getContract<BridgeAssistNativeUpgradeable>(
    'BridgeAssistNativeUpgradeable'
  )

  const bridgeCircle = await ethers.getContract<BridgeAssistCircleMintUpgradeable>(
    'BridgeAssistCircleMintUpgradeable'
  )
  const bridgeTransfer = await ethers.getContract<BridgeAssistTransferUpgradeable>(
    'BridgeAssistTransferUpgradeable'
  )

  const mulsigwallet = MULTISIG_ADDRESSES[chainId]

  console.log(`Bridge Mint ${bridgeMint.address}`)
  console.log(`Bridge Circle ${bridgeCircle.address}`)
  console.log(`Bridge Native ${bridgeNative.address}`)
  console.log(`Bridge Transfer ${bridgeTransfer.address}`)

  if (!mulsigwallet) throw new Error('Multisig not set')

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
          bridgeMint.address,
          bridgeNative.address,
          bridgeCircle.address,
          mulsigwallet,
          deployer.address,
        ],
      },
    },
    log: true,
  })
}
export default func


func.tags = ['BridgeFactoryUpgradeable.deploy']
// func.dependencies = ['MultiSigWallet.deploy']
