import { ethers } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'

import { wrapperHRE } from '@/gotbit-tools/hardhat'
import type {MultiSigWallet__factory } from '@/typechain'

const func: DeployFunction = async (hre) => {
  const { deploy } = wrapperHRE(hre)
  const [deployer, owner1, owner2] = await ethers.getSigners()

  await deploy<MultiSigWallet__factory>('MultiSigWallet', {
    from: deployer.address,
    args: [
        [deployer.address, owner1.address, owner2.address],
        2,
        "Multisig Wallet"
    ],
    log: true,
  })
}
export default func

func.tags = ['MultiSigWallet.deploy']
