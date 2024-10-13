import { deployments, ethers } from 'hardhat'

import {
  BridgeAssistMintUpgradeable,
  BridgeAssistNativeUpgradeable,
  BridgeFactoryUpgradeable,
  BridgedAssetChainToken,
  MockNativeBridge,
  MultiSigWallet,
  type BridgeAssistTransferUpgradeable,
  type Token,
  BridgeAssistCircleMintUpgradeable,
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
    mockNative: await ethers.getContract<MockNativeBridge>('MockNativeBridge'),
    multiSigWallet: await ethers.getContract<MultiSigWallet>('MultiSigWallet'),
    bridgeCircle: await ethers.getContract<BridgeAssistCircleMintUpgradeable>('BridgeAssistCircleMintUpgradeable'),
  }
}

export const deploy = deployments.createFixture(async () => {
  await deployments.fixture(undefined, { keepExistingDeployments: true })
  return useContracts()
})
