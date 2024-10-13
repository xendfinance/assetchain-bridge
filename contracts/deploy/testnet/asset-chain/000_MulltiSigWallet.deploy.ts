import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type {MultiSigWallet__factory } from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const deployers = await ethers.getSigners()

  if (deployers.length <2 ) throw new Error('Deployer Account Must be at least 2')

  await deploy<MultiSigWallet__factory>('MultiSigWallet', {
    from: deployers[0].address,
    args: [
        [deployers[0].address, deployers[1].address],
        2,
        "Multisig Wallet"
    ],
    log: true,
  })
}
export default func

func.tags = ['MultiSigWallet.deploy']
