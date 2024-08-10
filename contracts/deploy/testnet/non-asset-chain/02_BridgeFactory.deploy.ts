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

  // if (chainId == CHAIN_IDS.assetChain) {
  //   return
  // }

  // Fake tx for nonce incrementing
  const tx = await deployer.sendTransaction({
    to: deployer.address,
    value: 1,
  })
  console.log(`Incrementing nonce tx: ${tx.hash}`)
  await tx.wait()

  const nonce = await ethers.provider.getTransactionCount(deployer.address)
  const bridgeMint = ethers.utils.getContractAddress({
    from: deployer.address,
    nonce: nonce + 8,
  })
  const bridgeNative = ethers.utils.getContractAddress({
    from: deployer.address,
    nonce: nonce + 9,
  })

  const bridgeCircle = ethers.utils.getContractAddress({
    from: deployer.address,
    nonce: nonce + 10,
  })
  console.log(`future mint: ${bridgeMint}`);
  console.log(`future native: ${bridgeNative}`);

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
          bridgeMint,
          bridgeNative,
          bridgeCircle,
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
