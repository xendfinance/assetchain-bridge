import { ethers, getNamedAccounts } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import {BRIDGED_TOKEN_PARAMS, CHAIN_IDS, MAINNET_BRIDGED_TOKEN_PARAMS, MAINNET_CHAIN_IDS, MULTISIG_ADDRESSES} from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgedAssetChainToken__factory, MultiSigWallet } from '@/typechain'
import { BigNumber } from 'ethers'

const func: DeployFunction = async (hre) => {
  return
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  if (chainId != MAINNET_CHAIN_IDS.assetChain) {
    return
  }

  const token = 'BTC'
  const params = MAINNET_BRIDGED_TOKEN_PARAMS[chainId][token]

  if (!params) throw new Error('Token not set')

  const mulsigwallet = MULTISIG_ADDRESSES[MAINNET_CHAIN_IDS.assetChain]
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

func.tags = ['BTC.deploy']
// func.dependencies = ['MultiSigWallet.deploy']
