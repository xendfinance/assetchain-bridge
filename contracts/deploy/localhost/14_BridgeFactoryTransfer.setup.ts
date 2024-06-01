import { ethers } from 'hardhat'

import { BridgeFactoryUpgradeable } from '@/typechain'
import { setup } from '@/gotbit-tools/hardhat'

const func = setup('BridgeFactoryTransfer', async () => {
  const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

  const bridgeFactory = await ethers.getContract<BridgeFactoryUpgradeable>(
    'BridgeFactoryUpgradeable'
  )

  const creatorRole = await bridgeFactory.CREATOR_ROLE()
  await bridgeFactory.connect(deployer).grantRole(creatorRole, bridgeCreator.address)
})
export default func

func.tags = ['BridgeFactoryUpgradeable.setup']
func.dependencies = ['BridgeFactoryUpgradeable.deploy']
