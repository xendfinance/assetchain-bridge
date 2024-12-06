import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import { CHAIN_IDS } from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgeAssistMintUpgradeable__factory, BridgeAssistTransferUpgradeable__factory } from '@/typechain'

const token = ``
const owner = ``
const relayers : string[] = []

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  // const { chainId } = await ethers.provider.getNetwork()

  if (!token) throw new Error('Token not Set')
  if (!owner) throw new Error('Owner not Set')
  if (relayers.length <=0) throw new Error('Relayers not Set')

  await deploy<BridgeAssistMintUpgradeable__factory>(
    'BridgeAssistMintUpgradeable',
    {
      contract: 'BridgeAssistMintUpgradeable',
      from: deployer.address,
      args: [],
      proxy: {
        owner: deployer.address,
        proxyContract: 'OpenZeppelinTransparentProxy',
        execute: {
          methodName: 'initialize',
          args: [
            '', //token adress
            0,
            '', ///
            0,
            0,
            '', /// 
            [], // relayers
            1,
          ],
        },
      },
      log: true,
    }
  )
}
export default func
