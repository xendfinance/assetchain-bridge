import { ethers, getNamedAccounts } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import {BRIDGED_TOKEN_PARAMS, CHAIN_IDS} from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { BridgedAssetChainToken__factory } from '@/typechain'
import { BigNumber } from 'ethers'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  if (chainId != CHAIN_IDS.assetChain) {
    return
  }

  // Fake tx for nonce incrementing
  const tx = await deployer.sendTransaction({
    to: deployer.address,
    value: 1,
  })
  console.log(`Incrementing nonce tx: ${tx.hash}`)
  await tx.wait()

  const token = 'WETH'
  const params = BRIDGED_TOKEN_PARAMS[chainId][token]

  await deploy<BridgedAssetChainToken__factory>(token, {
    contract: 'BridgedAssetChainToken',
    from: deployer.address,
    args: [
      params.name,
      params.symbol,
      params.decimals,
      BigNumber.from(params.totalSupply),
      deployer.address,
      params.isLockActive,
      params.tokenOriginal,
      params.chainIdOriginal,
    ],
    log: true,
  })
}
export default func

func.tags = ['WETH.deploy']
