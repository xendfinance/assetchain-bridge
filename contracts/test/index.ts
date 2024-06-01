import { deployments, ethers } from 'hardhat'

import {
  BridgeAssistMintUpgradeable,
  BridgeAssistNativeUpgradeable,
  BridgeFactoryUpgradeable,
  BridgedAssetChainToken,
  MockNativeBridge,
  type BridgeAssistTransferUpgradeable,
  type Token,
} from '@/typechain'

export const useContracts = async () => {
  return {
    token: await ethers.getContract<Token>('Token'),
    assetToken: await ethers.getContract<BridgedAssetChainToken>('BridgedAssetChainToken'),

    bridgeDefault: await ethers.getContract<BridgeAssistTransferUpgradeable>('BridgeAssistTransferUpgradeable'),
    bridgeFactory: await ethers.getContract<BridgeFactoryUpgradeable>(
      'BridgeFactoryUpgradeable'
    ),

    bridgeMint: await ethers.getContract<BridgeAssistMintUpgradeable>('BridgeAssistMintUpgradeable'),
    bridgeNative: await ethers.getContract<BridgeAssistNativeUpgradeable>('BridgeAssistNativeUpgradeable'),
    mockNative: await ethers.getContract<MockNativeBridge>('MockNativeBridge')
  }
}

export const deploy = deployments.createFixture(async () => {
  await deployments.fixture(undefined, { keepExistingDeployments: true })
  return useContracts()
})
