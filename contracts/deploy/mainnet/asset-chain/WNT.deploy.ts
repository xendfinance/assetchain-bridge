import { ethers, getNamedAccounts } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import {BRIDGED_TOKEN_PARAMS, CHAIN_IDS, MAINNET_BRIDGED_TOKEN_PARAMS} from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgedAssetChainToken__factory, MultiSigWallet } from '@/typechain'
import { BigNumber } from 'ethers'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  if (chainId != CHAIN_IDS.assetChain) {
    return
  }

  const token = 'WNT'
  const params = MAINNET_BRIDGED_TOKEN_PARAMS[chainId][token]

  if (!token) throw new Error('Token not set')

  const mulsigwallet = '' // address
  if (!mulsigwallet) throw new Error('Set address')

  await deploy<BridgedAssetChainToken__factory>(token, {
    contract: 'BridgedAssetChainToken',
    from: deployer.address,
    args: [
      params.name,
      params.symbol,
      params.decimals,
      BigNumber.from(params.totalSupply),
      params.isLockActive,
      params.tokenOriginal,
      params.chainIdOriginal,
      mulsigwallet
    ],
    log: true,
  })
}
export default func

func.tags = ['WNT.deploy']
// func.dependencies = ['MultiSigWallet.deploy']