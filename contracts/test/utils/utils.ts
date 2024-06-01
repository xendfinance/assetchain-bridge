import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  BridgedAssetChainToken__factory,
  BridgeAssistTransferUpgradeable,
  BridgeAssistMintUpgradeable,
  BridgeAssistNativeUpgradeable,
  Token__factory,
} from '@/typechain'

export enum AllBridgeTypes {
  DEFAULT,
  MINT,
  NATIVE,
}

export async function disableInitializer(contract: string) {
  const INITIALIZERS_SLOT = 0
  const value = ethers.utils.hexlify(ethers.utils.zeroPad(BigNumber.from(0)._hex, 32))
  await ethers.provider.send('hardhat_setStorageAt', [
    contract,
    ethers.utils.hexValue(INITIALIZERS_SLOT),
    value,
  ])
}

export async function bridgeSetup(
  bridge:
    | BridgeAssistTransferUpgradeable
    | BridgeAssistNativeUpgradeable
    | BridgeAssistMintUpgradeable,
  deployer: SignerWithAddress,
  bridgeType: AllBridgeTypes
) {
  const managerRole = await bridge.MANAGER_ROLE()
  await bridge.connect(deployer).grantRole(managerRole, deployer.address)
  await bridge.connect(deployer).addChains(['NEAR', 'AVAX'], [0, 9])

  if (bridgeType == AllBridgeTypes.DEFAULT) {
    const token = Token__factory.connect(await bridge.TOKEN(), ethers.provider)
    await token.connect(deployer).transfer(bridge.address, '500_000'.toBigNumber())
  } else if (bridgeType == AllBridgeTypes.NATIVE) {
    await deployer.sendTransaction({
      to: bridge.address,
      value: ethers.utils.parseEther('4000'), // Sends exactly 1.0 ether
    })
  } else {
    const token = BridgedAssetChainToken__factory.connect(
      await bridge.TOKEN(),
      ethers.provider
    )

    const minterRole = await token.MINTER_ROLE()
    const burnerRole = await token.BURNER_ROLE()
    await token.connect(deployer).grantRole(minterRole, bridge.address)
    await token.connect(deployer).grantRole(burnerRole, bridge.address)
  }
}

export function accessControlError(account: string, role: string): string {
  return `AccessControl: account ${account.toLowerCase()} is missing role ${role.toLowerCase()}`
}
