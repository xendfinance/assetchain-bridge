import { ethers, getNamedAccounts } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'

import type { BridgedAssetChainToken__factory } from '../../../typechain'
import { BigNumber } from 'ethers'
// import { wrapperHRE } from '../../../utils/helpers'
import {
  BRIDGED_TOKEN_PARAMS,
  CHAIN_IDS,
  MAINNET_CHAIN_IDS,
  MULTISIG_ADDRESSES,
} from '../../../config'
import { wrapperHRE } from '@/gotbit-tools/hardhat'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  if (chainId != CHAIN_IDS.assetChain) {
    return
  }

  const token = 'xRWA'
  const params = BRIDGED_TOKEN_PARAMS[chainId]['USDT']
  const mulsigwallet = MULTISIG_ADDRESSES[MAINNET_CHAIN_IDS.assetChain]
  if (!mulsigwallet) throw new Error('Multisig wallet not set')

  //   const mulsigwallet = await ethers.getContract<MultiSigWallet>('MultiSigWallet')

  await deploy<BridgedAssetChainToken__factory>(token, {
    contract: 'BridgedAssetChainToken',
    from: deployer.address,
    args: [
      'Xend Finance RWA',
      token,
      18,
      0,
      params.isLockActive,
      params.tokenOriginal,
      params.chainIdOriginal,
      mulsigwallet,
    ],
    log: true,
  })
}
export default func

func.tags = ['xRWA.deploy']
// func.dependencies = ['MultiSigWallet.deploy']
