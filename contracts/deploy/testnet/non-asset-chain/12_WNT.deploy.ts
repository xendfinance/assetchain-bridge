import { ethers, getNamedAccounts } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'
import { CHAIN_IDS, DEFAULT_TOKEN_PARAMS } from '@/config'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type { DefaultToken__factory } from '@/typechain'
import { BigNumber } from 'ethers'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()
  
  if (chainId != CHAIN_IDS.polygon && chainId != CHAIN_IDS.arbitrum) {
    return
  }

  const token = 'WNT'
  const params = DEFAULT_TOKEN_PARAMS[chainId][token]

  await deploy<DefaultToken__factory>(token, {
    contract: 'DefaultToken',
    from: deployer.address,
    args: [params.name, params.symbol, params.decimals, BigNumber.from(params.totalSupply)],
    log: true,
  })
}
export default func

func.tags = ['WNT.deploy']
