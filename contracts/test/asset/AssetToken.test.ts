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
          false,
          ORIGINAL_TOKEN,
          ORIGINAL_CHAIN_ID,
          ethers.constants.AddressZero
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
          false,
          ORIGINAL_TOKEN,
          ORIGINAL_CHAIN_ID,
          ethers.constants.AddressZero
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
          false,
          ethers.constants.AddressZero,
          ORIGINAL_CHAIN_ID,
          ethers.constants.AddressZero
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
          false,
          ORIGINAL_TOKEN,
          0,
          ethers.constants.AddressZero
        )
    ).revertedWith('Chain id original: zero')
  })
  it('constructor', async () => {
    const { assetToken, multiSigWallet } = await useContracts()
    const [deployer] = await ethers.getSigners()

    expect(await assetToken.name()).eq(NAME + ' (Bridged)')
    expect(await assetToken.symbol()).eq(SYMBOL)
    expect(await assetToken.decimals()).eq(DECIMALS)
    expect(await assetToken.totalSupply()).eq(
      TOTAL_SUPPLY.mul(BigNumber.from(10).pow(DECIMALS))
    )
    expect(
      await assetToken.hasRole(
        await assetToken.DEFAULT_ADMIN_ROLE(),
        multiSigWallet.address
      )
    ).true

    expect(await assetToken.balanceOf(deployer.address)).eq(
      TOTAL_SUPPLY.mul(BigNumber.from(10).pow(DECIMALS))
    )
    expect(await assetToken.isLockActive()).false
    expect(await assetToken.TOKEN_ORIGINAL()).eq(ORIGINAL_TOKEN)
    expect(await assetToken.CHAIN_ID_ORIGINAL()).eq(ORIGINAL_CHAIN_ID)
    expect(await assetToken.MULTISIG_WALLET()).eq(multiSigWallet.address)
  })
  it('mint/burn', async () => {
    const { assetToken, multiSigWallet } = await useContracts()
    const [deployer, user] = await ethers.getSigners()

    const minterRole = await assetToken.MINTER_ROLE()
    const burnerRole = await assetToken.BURNER_ROLE()

    const userBalance = 100
    await assetToken.connect(deployer).transfer(user.address, userBalance)

    await expect(assetToken.connect(user).mint(user.address, 100)).reverted
    await expect(assetToken.connect(user).burn(deployer.address, 100)).reverted

    const mintGrantRole = assetToken.interface.encodeFunctionData('grantRole', [
      minterRole,
      deployer.address,
    ])
    const burnGrantRole = assetToken.interface.encodeFunctionData('grantRole', [
      burnerRole,
      deployer.address,
    ])

    await multiSigWallet
      .connect(deployer)
      .createTransaction(assetToken.address, mintGrantRole)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(assetToken.address, burnGrantRole)

    await multiSigWallet.connect(user).approveTransaction(1)
    await multiSigWallet.connect(user).approveTransaction(2)
    await assetToken.connect(deployer).mint(user.address, userBalance)
    expect(await assetToken.balanceOf(user.address)).eq(userBalance * 2)
    await assetToken.connect(deployer).burn(user.address, userBalance)
    expect(await assetToken.balanceOf(user.address)).eq(userBalance)
  })
  it('lock', async () => {
    const [deployer, user, user2] = await ethers.getSigners()
    const { multiSigWallet } = await useContracts()

    const assetTokenFactory: BridgedAssetChainToken__factory =
      await ethers.getContractFactory('BridgedAssetChainToken', deployer)
    const token = await assetTokenFactory.deploy(
      NAME,
      SYMBOL,
      DECIMALS,
      TOTAL_SUPPLY,
      true,
      ORIGINAL_TOKEN,
      ORIGINAL_CHAIN_ID,
      multiSigWallet.address
    )

    expect(await token.isLockActive()).true

    // Test transferring tokens while locked
    await token.connect(deployer).transfer(user.address, 500)

    // Create transaction data for setBlacklisted
    const blacklistData = token.interface.encodeFunctionData('setBlacklisted', [
      user.address,
      true,
    ])

    // Submit, confirm, and execute the blacklist transaction
    await multiSigWallet.connect(deployer).createTransaction(token.address, blacklistData)

    await multiSigWallet.connect(user2).approveTransaction(1)

    await expect(token.connect(deployer).transfer(user.address, 100)).to.be.revertedWith(
      'Transfer is not allowed'
    )

    // Create transaction data for setBlacklisted (remove from blacklist)
    const removeBlacklistData = token.interface.encodeFunctionData('setBlacklisted', [
      user.address,
      false,
    ])

    // Submit, confirm, and execute the remove from blacklist transaction
    await multiSigWallet
      .connect(deployer)
      .createTransaction(token.address, removeBlacklistData)
    await multiSigWallet.connect(user).approveTransaction(2)

    await token.connect(deployer).transfer(user.address, 500)

    expect(await token.balanceOf(user.address)).eq(1000)

    await expect(token.connect(user).disableLockStage()).revertedWith(`Caller is not the multisig wallet`)

    const disableLockStageDate = token.interface.encodeFunctionData('disableLockStage')

    await multiSigWallet
      .connect(deployer)
      .createTransaction(token.address, disableLockStageDate)
    await multiSigWallet.connect(user).approveTransaction(3)
    // await token.connect(deployer).disableLockStage()

    expect(await token.isLockActive()).false
  })
})
