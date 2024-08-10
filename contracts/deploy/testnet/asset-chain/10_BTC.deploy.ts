import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import {BRIDGED_TOKEN_PARAMS, CHAIN_IDS} from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgedAssetChainToken__factory, DefaultToken__factory, MultiSigWallet } from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  if (chainId != CHAIN_IDS.assetChain) {
    return
  }

  const token = 'BTC'
  const params = BRIDGED_TOKEN_PARAMS[chainId][token]

  // const mulsigwallet = await ethers.getContract<MultiSigWallet>('MultiSigWallet')

  await deploy<DefaultToken__factory>(token, {
    contract: 'DefaultToken',
    from: deployer.address,
    args: ['Wrapped Bitcoin', 'BTC', 18, 200000000],
    log: true,
  })
}
export default func

func.tags = ['BTC.deploy']
