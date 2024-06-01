import { ethers } from 'hardhat'
import { expect } from 'chai'

import { deploy, useContracts } from '@/test'
import { BridgedAssetChainToken__factory } from '@/typechain'
import {
  DECIMALS,
  NAME,
  ORIGINAL_CHAIN_ID,
  ORIGINAL_TOKEN,
  SYMBOL,
  TOTAL_SUPPLY,
} from '@/deploy/localhost/02_AssetToken.deploy'
import { BigNumber } from 'ethers'

describe('BridgedAssetChainToken contract', () => {
  beforeEach(async () => {
    await deploy()
  })
  it('constructor requires', async function () {
    const [deployer] = await ethers.getSigners()

    const assetTokenFactory: BridgedAssetChainToken__factory =
      await ethers.getContractFactory('BridgedAssetChainToken', deployer)

    await expect(
      assetTokenFactory
        .connect(deployer)
        .deploy(
          '',
          SYMBOL,
          DECIMALS,
          TOTAL_SUPPLY,
          deployer.address,
          false,
          ORIGINAL_TOKEN,
          ORIGINAL_CHAIN_ID
        )
    ).revertedWith('Empty name')
    await expect(
      assetTokenFactory
        .connect(deployer)
        .deploy(
          NAME,
          '',
          DECIMALS,
          TOTAL_SUPPLY,
          deployer.address,
          false,
          ORIGINAL_TOKEN,
          ORIGINAL_CHAIN_ID
        )
    ).revertedWith('Empty symbol')
    await expect(
      assetTokenFactory
        .connect(deployer)
        .deploy(
          NAME,
          SYMBOL,
          DECIMALS,
          TOTAL_SUPPLY,
          ethers.constants.AddressZero,
          false,
          ORIGINAL_TOKEN,
          ORIGINAL_CHAIN_ID
        )
    ).revertedWith('Owner: zero address')
    await expect(
      assetTokenFactory
        .connect(deployer)
        .deploy(
          NAME,
          SYMBOL,
          DECIMALS,
          TOTAL_SUPPLY,
          deployer.address,
          false,
          ethers.constants.AddressZero,
          ORIGINAL_CHAIN_ID
        )
    ).revertedWith('Token original: zero address')
    await expect(
      assetTokenFactory
        .connect(deployer)
        .deploy(
          NAME,
          SYMBOL,
          DECIMALS,
          TOTAL_SUPPLY,
          deployer.address,
          false,
          ORIGINAL_TOKEN,
          0
        )
    ).revertedWith('Chain id original: zero')
  })
  it('constructor', async () => {
    const { assetToken } = await useContracts()
    const [deployer] = await ethers.getSigners()

    expect(await assetToken.name()).eq(NAME + ' (Bridged)')
    expect(await assetToken.symbol()).eq(SYMBOL)
    expect(await assetToken.decimals()).eq(DECIMALS)
    expect(await assetToken.totalSupply()).eq(
      TOTAL_SUPPLY.mul(BigNumber.from(10).pow(DECIMALS))
    )
    expect(
      await assetToken.hasRole(await assetToken.DEFAULT_ADMIN_ROLE(), deployer.address)
    ).true

    expect(await assetToken.balanceOf(deployer.address)).eq(
      TOTAL_SUPPLY.mul(BigNumber.from(10).pow(DECIMALS))
    )
    expect(await assetToken.isLockActive()).false
    expect(await assetToken.TOKEN_ORIGINAL()).eq(ORIGINAL_TOKEN)
    expect(await assetToken.CHAIN_ID_ORIGINAL()).eq(ORIGINAL_CHAIN_ID)
  })
  it('mint/burn', async () => {
    const { assetToken } = await useContracts()
    const [deployer, user] = await ethers.getSigners()

    const minterRole = await assetToken.MINTER_ROLE()
    const burnerRole = await assetToken.BURNER_ROLE()

    const userBalance = 100
    await assetToken.connect(deployer).transfer(user.address, userBalance)

    await expect(assetToken.connect(user).mint(user.address, 100)).reverted
    await expect(assetToken.connect(user).burn(deployer.address, 100)).reverted

    await assetToken.connect(deployer).grantRole(minterRole, deployer.address)
    await assetToken.connect(deployer).grantRole(burnerRole, deployer.address)
    await assetToken.connect(deployer).mint(user.address, userBalance)
    expect(await assetToken.balanceOf(user.address)).eq(userBalance * 2)
    await assetToken.connect(deployer).burn(user.address, userBalance)
    expect(await assetToken.balanceOf(user.address)).eq(userBalance)
  })
  it('lock', async () => {
    const [deployer, user] = await ethers.getSigners()

    const assetTokenFactory: BridgedAssetChainToken__factory =
      await ethers.getContractFactory('BridgedAssetChainToken', deployer)
    const token = await assetTokenFactory.deploy(
      NAME,
      SYMBOL,
      DECIMALS,
      TOTAL_SUPPLY,
      deployer.address,
      true,
      ORIGINAL_TOKEN,
      ORIGINAL_CHAIN_ID
    )
    expect(await token.isLockActive()).true

    await token.connect(deployer).transfer(user.address, 500)

    await expect(token.connect(deployer).setBlacklisted(user.address, true)).reverted
    await token
      .connect(deployer)
      .grantRole(await token.BLACKLISTER_ROLE(), deployer.address)
    expect(await token.isBlacklisted(user.address)).false
    await token.connect(deployer).setBlacklisted(user.address, true)
    expect(await token.isBlacklisted(user.address)).true

    await expect(token.connect(deployer).setBlacklisted(user.address, true)).revertedWith(
      'Duplicate'
    )

    await expect(token.connect(deployer).transfer(user.address, 100)).revertedWith(
      'Transfer is not allowed'
    )
    await expect(token.connect(user).transfer(deployer.address, 100)).revertedWith(
      'Transfer is not allowed'
    )

    await expect(token.connect(user).disableLockStage()).reverted
    await token.connect(deployer).disableLockStage()
    expect(await token.isLockActive()).false
    expect(await token.isBlacklisted(user.address)).true

    await expect(token.connect(deployer).setBlacklisted(user.address, false))
    await expect(token.connect(deployer).transfer(user.address, 500)).not.reverted

    await expect(token.connect(deployer).disableLockStage()).revertedWith(
      'Lock stage is not active'
    )
    await expect(token.connect(deployer).setBlacklisted(user.address, true)).revertedWith(
      'Lock stage is not active'
    )
  })
})
