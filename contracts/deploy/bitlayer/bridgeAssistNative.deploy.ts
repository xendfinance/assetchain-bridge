import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import { CHAIN_IDS } from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type {  BridgeAssistNativeUpgradeable__factory } from '@/typechain'
const NATIVE_TOKEN = '0x0000000000000000000000000000000000000001'

const owner = ``
const relayers : string[] = []

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  if (!owner) throw new Error('Owner not Set')
  if (relayers.length <=0) throw new Error('Relayers not Set')

  await deploy<BridgeAssistNativeUpgradeable__factory>(
    'BridgeAssistNativeUpgradeable',
    {
      contract: 'BridgeAssistNativeUpgradeable',
      from: deployer.address,
      args: [],
      proxy: {
        owner: deployer.address,
        proxyContract: 'OpenZeppelinTransparentProxy',
        execute: {
          methodName: 'initialize',
          args: [
            NATIVE_TOKEN,
            0,
            owner,
            0,
            0,
            owner,
            relayers,
            1,
          ],
        },
      },
      log: true,
    }
  )
}
export default func
