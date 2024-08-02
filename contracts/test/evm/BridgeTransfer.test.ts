import { ethers } from 'hardhat'
import { expect } from 'chai'

import { deploy, useContracts } from '@/test'
import { BigNumber, BigNumberish } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BridgeAssistTransferUpgradeable__factory } from '@/typechain'
import {
  DEFAULT_FEE_FULFILL,
  DEFAULT_FEE_SEND,
  DEFAULT_LIMIT_PER_SEND,
  DEFAULT_RELAYER_CONSENSUS_THRESHOLD,
} from '../utils/constants'
import { AllBridgeTypes, bridgeSetup } from '../utils/utils'
import { signHashedTransaction } from '../utils/eip712'
import { BridgeType } from '../asset/BridgeFactoryAsset.test'

const ERROR = {
  Limit: 'Amount is more than limit',
  WrongSignature: 'Bad signature at index0',
  FulfilledSignature: 'Signature already fulfilled',
  WrongChain: 'Wrong "toChain" in tx struct',
  WrongFromChain: 'Not supported fromChain',
  ZeroAmount: 'Amount = 0',
  AmountNotWhole: 'Amount is not divisible by exchange rate',
  AmountTooSmall: 'amount < fee denominator',
  EmptyToUser: 'Field toUser is empty',
  FeeWalletRepeat: 'Fee wallet repeats',
  LimitPerSendRepeat: 'Limit per send repeats',
  FeeRepeat: 'Fee numerator repeats',
  FeeToHigh: 'Fee is too high',
  UnknownChain: 'Chain is not supported',
  ChainAlreadyInList: 'Chain is already in the list',
  ChainNotInList: 'Chain is not in the list yet',
  WrongLengthAddress: 'toAddress_outOfBounds',
  NotEvenLength: 'Not even length',
  ZeroAddressFeeWallet: 'Fee wallet is zero address',
  Paused: 'Pausable: paused',
  NotPaused: 'Pausable: not paused',
  ExchangeRateModified: 'cannot modify the exchange rate',
  UnderOverFlow:
    'Arithmetic operation underflowed or overflowed outside of an unchecked block',
  BadToken: 'bad token',
  BadInput: 'bad input',
  BadOffsetLimit: 'bad offset/limit',
  NoRelayers: 'No relayers',
  TooManyRelayers: 'Too many relayers',
  ZeroOfN: '0-of-N',
  NOfN: 'N-of-N',
  DuplicateRelayers: 'Duplicate relayers',
}

const feePercent = 1000 // eq 1000 / 10000 = 10%
const nearAddress = 'gotbit.testnet'
const nearAddress1 = 'gotbit.testnet1'
const nearAddress2 = 'gotbit.testnet2'

// const evmChain = 'BSC'
const evmChain = 'evm.31337'
const CHAIN_ID = 31337
const nearChain = 'NEAR'

describe('BridgeAssistTransfer contract', () => {
  beforeEach(async () => {
    await deploy()
  })
  it('constructor requires', async function () {
    const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()
    const { token, bridgeFactory, multiSigWallet } = await useContracts()
    const zero = ethers.constants.AddressZero

    const tokenZeroData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.NATIVE,
        zero,
        ethers.utils.parseEther('100'),
        deployer.address,
        0,
        0,
        deployer.address,
        [relayer.address],
        1,
      ]
    )
    const feeWalletZeroData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        ethers.utils.parseEther('100'),
        zero,
        0,
        0,
        deployer.address,
        [relayer.address],
        1,
      ]
    )
    const ownerZeroData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        ethers.utils.parseEther('100'),
        deployer.address,
        0,
        0,
        zero,
        [relayer.address],
        1,
      ]
    )
    const feeSendHighSend = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        ethers.utils.parseEther('100'),
        deployer.address,
        10_000,
        0,
        deployer.address,
        [relayer.address],
        1,
      ]
    )
    const feeFulfillData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        ethers.utils.parseEther('100'),
        deployer.address,
        0,
        10_000,
        deployer.address,
        [relayer.address],
        1,
      ]
    )

    const NoRelayersData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        ethers.utils.parseEther('100'),
        deployer.address,
        0,
        0,
        deployer.address,
        [],
        1,
      ]
    )
    const TooManyRelayersData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        ethers.utils.parseEther('100'),
        deployer.address,
        0,
        0,
        deployer.address,
        Array(101).fill(relayer.address),
        1,
      ]
    )
    const DuplicateRelayersData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        ethers.utils.parseEther('100'),
        deployer.address,
        0,
        0,
        deployer.address,
        [relayer.address, deployer.address, relayer.address],
        1,
      ]
    )

    const ZeroOfNData = bridgeFactory.interface.encodeFunctionData('createBridgeAssist', [
      BridgeType.DEFAULT,
      token.address,
      ethers.utils.parseEther('100'),
      deployer.address,
      0,
      0,
      deployer.address,
      [relayer.address],
      0,
    ])
    const NOfNData = bridgeFactory.interface.encodeFunctionData('createBridgeAssist', [
      BridgeType.DEFAULT,
      token.address,
      ethers.utils.parseEther('100'),
      deployer.address,
      0,
      0,
      deployer.address,
      [relayer.address],
      2,
    ])

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, tokenZeroData)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, feeWalletZeroData)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, ownerZeroData)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, feeSendHighSend)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, feeFulfillData)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, NoRelayersData)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, TooManyRelayersData)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, DuplicateRelayersData)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, ZeroOfNData)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, NOfNData)

    await expect(multiSigWallet.connect(relayer).approveTransaction(1)).reverted

    await expect(multiSigWallet.connect(relayer).approveTransaction(2)).reverted

    await expect(multiSigWallet.connect(relayer).approveTransaction(3)).reverted

    await expect(multiSigWallet.connect(relayer).approveTransaction(4)).reverted

    await expect(multiSigWallet.connect(relayer).approveTransaction(5)).reverted

    await expect(multiSigWallet.connect(relayer).approveTransaction(6)).reverted

    await expect(multiSigWallet.connect(relayer).approveTransaction(7)).reverted

    await expect(multiSigWallet.connect(relayer).approveTransaction(8)).reverted

    await expect(multiSigWallet.connect(relayer).approveTransaction(9)).reverted

    await expect(multiSigWallet.connect(relayer).approveTransaction(10)).reverted
  })
  it('Re-initialize should revert', async () => {
    const { bridgeDefault, token } = await useContracts()
    const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

    await expect(
      bridgeDefault
        .connect(deployer)
        .initialize(
          token.address,
          DEFAULT_LIMIT_PER_SEND,
          feeWallet.address,
          DEFAULT_FEE_SEND,
          DEFAULT_FEE_FULFILL,
          bridgeCreator.address,
          [relayer.address],
          DEFAULT_RELAYER_CONSENSUS_THRESHOLD
        )
    ).revertedWith('Initializable: contract is already initialized')
  })
  it('should send tokens', async () => {
    const { token, bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        DEFAULT_LIMIT_PER_SEND,
        feeWallet.address,
        DEFAULT_FEE_SEND,
        DEFAULT_FEE_FULFILL,
        deployer.address,
        [relayer.address],
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD,
      ]
    )

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, createBridgeData)

    await multiSigWallet.connect(relayer).approveTransaction(1)
    const bridgeAddr = await bridgeFactory.getBridgeByToken(token.address, 0)
    const bridgeDefault = BridgeAssistTransferUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeDefault, deployer, AllBridgeTypes.DEFAULT)

    const bridgeAmountBefore = await token.balanceOf(bridgeDefault.address)
    const exchangeRate = await bridgeDefault.exchangeRateFrom(
      ethers.utils.formatBytes32String(nearChain)
    )
    const amount = '100'.toBigNumber(18)

    // await expect(
    //   bridgeDefault.connect(user).send(amount.sub(1), nearAddress, nearChain)
    // ).to.be.revertedWith(ERROR.AmountNotWhole)
    await expect(
      bridgeDefault.connect(user).send(exchangeRate, nearAddress, nearChain)
    ).to.be.revertedWith(ERROR.AmountTooSmall)

    await expect(
      bridgeDefault.connect(user).send(0, nearAddress, nearChain)
    ).to.be.revertedWith(ERROR.ZeroAmount)
    await expect(
      bridgeDefault.connect(user).send(amount, '', nearChain)
    ).to.be.revertedWith(ERROR.EmptyToUser)
    await expect(
      bridgeDefault.connect(user).send(amount, 'somechainusername', 'UNKNOWN_CHAIN')
    ).to.be.revertedWith(ERROR.UnknownChain)
    await expect(
      bridgeDefault.connect(user).send(amount.sub(1), 'someuser', 'AVAX')
    ).revertedWith('Amount is not divisible by exchange rate')

    // send tokens to user
    await token.connect(deployer).transfer(user.address, amount)

    await token.connect(user).approve(bridgeDefault.address, amount)
    await bridgeDefault.connect(user).send(amount, nearAddress, nearChain)

    const transactions = await bridgeDefault.getUserTransactions(
      user.address.toLowerCase()
    )
    const tx = transactions[0]

    expect(tx.fromUser.toLowerCase()).eq(user.address.toLowerCase())
    expect(tx.toUser).eq(nearAddress)
    expect(tx.amount).eq(amount)
    expect(tx.fromChain).eq(evmChain)
    expect(tx.toChain).eq(nearChain)
    expect(tx.nonce).eq(0)
    expect(await token.balanceOf(user.address)).eq(0)
    expect(await token.balanceOf(bridgeDefault.address)).eq(
      bridgeAmountBefore.add(amount)
    )
    expect(await bridgeDefault.getUserTransactionsAmount(user.address)).to.eq(1)

    expect(
      await bridgeDefault.getUserTransactionsSlice(user.address, 0, 1)
    ).is.deep.equal([tx])
    expect(bridgeDefault.getUserTransactionsSlice(user.address, 1, 1)).to.be.revertedWith(
      ERROR.BadOffsetLimit
    )

    expect(await bridgeDefault.nonce()).eq(1)
  })
  it('should fulfill tokens from bridgeDefault preventing double-spend', async () => {
    const { token, bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        DEFAULT_LIMIT_PER_SEND,
        feeWallet.address,
        DEFAULT_FEE_SEND,
        DEFAULT_FEE_FULFILL,
        deployer.address,
        [relayer.address],
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD,
      ]
    )

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, createBridgeData)

    await multiSigWallet.connect(relayer).approveTransaction(1)
    const bridgeAddr = await bridgeFactory.getBridgeByToken(token.address, 0)
    const bridgeDefault = BridgeAssistTransferUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeDefault, deployer, AllBridgeTypes.DEFAULT)

    const tx = {
      fromUser: nearAddress,
      toUser: user.address,
      amount: '10'.toBigNumber(9),
      fromChain: nearChain,
      nonce: '0'.toBigNumber(),
    }

    const wrongFromChainTx = {
      fromUser: nearAddress,
      toUser: user.address,
      amount: '10'.toBigNumber(9),
      fromChain: 'UNKNOWN CHAIN',
      nonce: '0'.toBigNumber(),
    }

    // sign by relayer transaction

    const signature = await signHashedTransaction(
      relayer,
      tx,
      CHAIN_ID,
      bridgeDefault.address
    )
    const fakeSignature = await signHashedTransaction(
      deployer,
      tx,
      CHAIN_ID,
      bridgeDefault.address
    )

    await expect(
      bridgeDefault.connect(user).fulfill(wrongFromChainTx, [signature])
    ).revertedWith(ERROR.WrongFromChain)

    await expect(bridgeDefault.connect(user).fulfill(tx, [fakeSignature])).revertedWith(
      ERROR.WrongSignature
    )
    await expect(bridgeDefault.connect(user).fulfill(tx, ['0x'])).revertedWith(
      'Not enough relayers'
    )
    await expect(bridgeDefault.connect(user).fulfill(tx, [])).revertedWith(
      'Bad signatures length'
    )
    await bridgeDefault.connect(user).fulfill(tx, [signature])

    // no fee withdrawing in this test cause we hadn't setuped it yet
    expect(await token.balanceOf(user.address)).eq(tx.amount)

    await expect(bridgeDefault.connect(user).fulfill(tx, [signature])).revertedWith(
      ERROR.FulfilledSignature
    )
  })
  it('multiple users test', async () => {
    const { token, bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator, user1, user2] =
      await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        DEFAULT_LIMIT_PER_SEND,
        feeWallet.address,
        DEFAULT_FEE_SEND,
        DEFAULT_FEE_FULFILL,
        deployer.address,
        [relayer.address],
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD,
      ]
    )

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, createBridgeData)

    await multiSigWallet.connect(relayer).approveTransaction(1)
    const bridgeAddr = await bridgeFactory.getBridgeByToken(token.address, 0)
    const bridgeDefault = BridgeAssistTransferUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeDefault, deployer, AllBridgeTypes.DEFAULT)

    const tx = {
      fromUser: nearAddress,
      toUser: user.address,
      amount: '10'.toBigNumber(9),
      fromChain: nearChain,
      nonce: '0'.toBigNumber(),
    }

    const tx1 = {
      fromUser: nearAddress1,
      toUser: user1.address,
      amount: '777'.toBigNumber(9),
      fromChain: nearChain,
      nonce: '1'.toBigNumber(),
    }

    const tx2 = {
      fromUser: nearAddress2,
      toUser: user2.address,
      amount: '999'.toBigNumber(9),
      fromChain: nearChain,
      nonce: '2'.toBigNumber(),
    }

    // sign by relayer transaction

    const signature = await signHashedTransaction(
      relayer,
      tx,
      CHAIN_ID,
      bridgeDefault.address
    )
    const signature1 = await signHashedTransaction(
      relayer,
      tx1,
      CHAIN_ID,
      bridgeDefault.address
    )
    const signature2 = await signHashedTransaction(
      relayer,
      tx2,
      CHAIN_ID,
      bridgeDefault.address
    )

    await bridgeDefault.connect(user).fulfill(tx, [signature])
    await bridgeDefault.connect(user1).fulfill(tx1, [signature1])
    await bridgeDefault.connect(user2).fulfill(tx2, [signature2])

    // no fee withdrawing in this test cause we hadn't setuped it yet
    expect(await token.balanceOf(user.address)).eq(tx.amount)
  })
  it('should take proper fee on fulfill and prevent double-spend', async () => {
    const { token, bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        DEFAULT_LIMIT_PER_SEND,
        feeWallet.address,
        DEFAULT_FEE_SEND,
        DEFAULT_FEE_FULFILL,
        deployer.address,
        [relayer.address],
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      ]
    )

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, createBridgeData)

    await multiSigWallet.connect(relayer).approveTransaction(1)
    const bridgeAddr = await bridgeFactory.getBridgeByToken(token.address, 0)
    const bridgeDefault = BridgeAssistTransferUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeDefault, deployer, AllBridgeTypes.DEFAULT)

    const tx = {
      fromUser: nearAddress,
      toUser: user.address.toLowerCase(),
      amount: BigNumber.from(10),
      timestamp: BigNumber.from(666),
      fromChain: nearChain,
      toChain: evmChain,
      nonce: BigNumber.from(0),
    }

    await bridgeDefault.connect(deployer).setFee(feePercent, feePercent)

    // const signature = await relayer.signMessage(ethers.utils.arrayify(hashedData))
    const signature = await signHashedTransaction(
      relayer,
      tx,
      CHAIN_ID,
      bridgeDefault.address
    )

    await bridgeDefault.connect(user).fulfill(tx, [signature])

    expect(await token.balanceOf(user.address)).eq(
      tx.amount.sub(tx.amount.mul(feePercent).div(10000))
    )
    expect(await token.balanceOf(feeWallet.address)).eq(
      tx.amount.mul(feePercent).div(10000)
    )

    await expect(bridgeDefault.connect(user).fulfill(tx, [signature])).revertedWith(
      ERROR.FulfilledSignature
    )
  })
  it('should not send with bad token', async () => {
    const { token, bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        DEFAULT_LIMIT_PER_SEND,
        feeWallet.address,
        DEFAULT_FEE_SEND,
        DEFAULT_FEE_FULFILL,
        deployer.address,
        [relayer.address],
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      ]
    )

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, createBridgeData)

    await multiSigWallet.connect(relayer).approveTransaction(1)
    const bridgeAddr = await bridgeFactory.getBridgeByToken(token.address, 0)
    const bridgeDefault = BridgeAssistTransferUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeDefault, deployer, AllBridgeTypes.DEFAULT)

    // send tokens to user
    const amount = '100'.toBigNumber()
    await token.connect(deployer).transfer(user.address, amount)
    await bridgeDefault.connect(deployer).setFee(feePercent, feePercent)

    await token.connect(user).approve(bridgeDefault.address, amount)
    await token.setFee(true)
    await expect(
      bridgeDefault.connect(user).send(amount, nearAddress, nearChain)
    ).revertedWith(ERROR.BadToken)
  })
  it('should not send over the limit', async () => {
    const { token, bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        DEFAULT_LIMIT_PER_SEND,
        feeWallet.address,
        DEFAULT_FEE_SEND,
        DEFAULT_FEE_FULFILL,
        deployer.address,
        [relayer.address],
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      ]
    )

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, createBridgeData)

    await multiSigWallet.connect(relayer).approveTransaction(1)
    const bridgeAddr = await bridgeFactory.getBridgeByToken(token.address, 0)
    const bridgeDefault = BridgeAssistTransferUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeDefault, deployer, AllBridgeTypes.DEFAULT)

    // send tokens to user
    const amount = '100'.toBigNumber()
    await token.connect(deployer).transfer(user.address, amount)
    await bridgeDefault.connect(deployer).setFee(feePercent, feePercent)

    await token.connect(user).approve(bridgeDefault.address, amount)
    await bridgeDefault.connect(user).send(amount, nearAddress, nearChain)
    await expect(
      bridgeDefault
        .connect(user)
        .send(amount.add('1'.toBigNumber(9)), nearAddress, nearChain)
    ).revertedWith(ERROR.Limit)
  })
  it('should withdraw, pause, set chains, set parameters, set relayers and prevent using incorrect values', async () => {
    const { token, bridgeFactory, multiSigWallet} = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        DEFAULT_LIMIT_PER_SEND,
        feeWallet.address,
        DEFAULT_FEE_SEND,
        DEFAULT_FEE_FULFILL,
        deployer.address,
        [relayer.address],
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      ]
    )

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, createBridgeData)

    await multiSigWallet.connect(relayer).approveTransaction(1)
    const bridgeAddr = await bridgeFactory.getBridgeByToken(token.address, 0)
    const bridgeDefault = BridgeAssistTransferUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeDefault, deployer, AllBridgeTypes.DEFAULT)

    await expect(bridgeDefault.connect(user).setFee(20, 20)).reverted
    await expect(bridgeDefault.connect(deployer).setFee(0, 0)).revertedWith(
      ERROR.FeeRepeat
    )
    await expect(bridgeDefault.connect(deployer).setFee(10000, 10000)).revertedWith(
      ERROR.FeeToHigh
    )
    await expect(bridgeDefault.connect(deployer).setFee(0, 10000)).revertedWith(
      ERROR.FeeToHigh
    )

    await expect(
      bridgeDefault.connect(deployer).setFeeWallet(feeWallet.address)
    ).revertedWith(ERROR.FeeWalletRepeat)
    await expect(
      bridgeDefault.connect(deployer).setFeeWallet(ethers.constants.AddressZero)
    ).revertedWith(ERROR.ZeroAddressFeeWallet)
    await expect(bridgeDefault.connect(user).setFeeWallet(deployer.address)).reverted
    await bridgeDefault.connect(deployer).setFeeWallet(deployer.address)
    expect(await bridgeDefault.feeWallet()).eq(deployer.address)

    await expect(
      bridgeDefault.connect(deployer).setLimitPerSend(ethers.utils.parseEther('100'))
    ).revertedWith(ERROR.LimitPerSendRepeat)
    await expect(bridgeDefault.connect(user).setLimitPerSend('20000'.toBigNumber(9)))
      .reverted
    await bridgeDefault.connect(deployer).setLimitPerSend('20000'.toBigNumber(9))
    expect(await bridgeDefault.limitPerSend()).eq('20000'.toBigNumber(9))

    // const bb = await token.balanceOf(deployer.address)
    // await expect(
    //   bridgeDefault.connect(user).withdraw(token.address, deployer.address, 50)
    // ).reverted
    // await bridgeDefault.connect(deployer).withdraw(token.address, deployer.address, 50)
    // expect(await token.balanceOf(deployer.address)).eq(bb.add(50))

    await expect(
      bridgeDefault.connect(deployer).addChains(['AAA'], [1337])
    ).to.be.revertedWith(ERROR.UnderOverFlow)
    await expect(
      bridgeDefault.connect(deployer).addChains(['NEAR'], [0])
    ).to.be.revertedWith(ERROR.ChainAlreadyInList)
    await expect(
      bridgeDefault.connect(deployer).addChains(['UNKNOWN'], [0, 0])
    ).to.be.revertedWith(ERROR.BadInput)
    await expect(
      bridgeDefault.connect(deployer).removeChains(['UNKNOWN'])
    ).to.be.revertedWith(ERROR.ChainNotInList)
    await expect(bridgeDefault.connect(user).addChains([nearChain], [0])).reverted
    await expect(bridgeDefault.connect(user).removeChains(['AVAX'])).reverted

    expect(await bridgeDefault.supportedChainList()).deep.eq([
      ethers.utils.formatBytes32String(nearChain),
      ethers.utils.formatBytes32String('AVAX'),
    ])
    await bridgeDefault.connect(deployer).removeChains(['AVAX'])
    expect(await bridgeDefault.supportedChainList()).deep.eq([
      ethers.utils.formatBytes32String(nearChain),
    ])
    await expect(
      bridgeDefault.connect(deployer).addChains(['AVAX'], [5])
    ).to.be.revertedWith(ERROR.ExchangeRateModified)

    const nearRate = await bridgeDefault.exchangeRateFrom(
      ethers.utils.formatBytes32String(nearChain)
    )
    await bridgeDefault.connect(deployer).removeChains([nearChain])
    await bridgeDefault.connect(deployer).addChains([nearChain], [0])

    await expect(bridgeDefault.connect(user).pause()).reverted
    await bridgeDefault.connect(deployer).pause()
    // send tokens to user
    const amount = '10'.toBigNumber()
    await token.connect(deployer).transfer(user.address, amount)
    await token.connect(user).approve(bridgeDefault.address, amount)
    await expect(
      bridgeDefault.connect(user).send(amount, nearAddress, nearChain)
    ).revertedWith(ERROR.Paused)
    await expect(
      bridgeDefault.connect(user).fulfill(
        {
          fromUser: nearAddress,
          toUser: user.address,
          amount: '10'.toBigNumber(9),
          fromChain: nearChain,
          nonce: '0'.toBigNumber(),
        },
        ['0x']
      )
    ).revertedWith(ERROR.Paused)
    await expect(bridgeDefault.connect(deployer).pause()).revertedWith(ERROR.Paused)

    await bridgeDefault.connect(deployer).unpause()
    await bridgeDefault.connect(user).send('10000'.toBigNumber(9), nearAddress, nearChain)
    await expect(bridgeDefault.connect(deployer).unpause()).revertedWith(ERROR.NotPaused)

    await expect(bridgeDefault.connect(deployer).setRelayers([], 0)).to.be.revertedWith(
      ERROR.NoRelayers
    )
    await expect(
      bridgeDefault.connect(deployer).setRelayers(Array(101).fill(deployer.address), 0)
    ).to.be.revertedWith(ERROR.TooManyRelayers)
    await expect(
      bridgeDefault
        .connect(deployer)
        .setRelayers([user.address, deployer.address, user.address], 1)
    ).to.be.revertedWith(ERROR.DuplicateRelayers)
    await expect(
      bridgeDefault.connect(deployer).setRelayers([deployer.address], 0)
    ).to.be.revertedWith(ERROR.ZeroOfN)
    await expect(
      bridgeDefault.connect(deployer).setRelayers([deployer.address], 2)
    ).to.be.revertedWith(ERROR.NOfN)
    await expect(bridgeDefault.connect(user).setRelayers([deployer.address], 1)).reverted

    await bridgeDefault.connect(deployer).setRelayers([deployer.address], 1)
    expect(await bridgeDefault.relayerConsensusThreshold()).to.eq(1)
    expect(await bridgeDefault.relayersLength()).to.eq(1)
    expect(await bridgeDefault.relayers(0)).to.eq(deployer.address)
    expect(await bridgeDefault.getRelayers()).to.deep.eq([deployer.address])
  })
  it('the signature from bridgeDefault is invalid on other bridgeDefault', async () => {
    const { token, bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        DEFAULT_LIMIT_PER_SEND,
        feeWallet.address,
        DEFAULT_FEE_SEND,
        DEFAULT_FEE_FULFILL,
        deployer.address,
        [relayer.address],
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      ]
    )

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, createBridgeData)

    await multiSigWallet.connect(relayer).approveTransaction(1)
    const bridgeAddr = await bridgeFactory.getBridgeByToken(token.address, 0)
    const bridge1 = BridgeAssistTransferUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridge1, deployer, AllBridgeTypes.DEFAULT)

    const createBridgeData2 = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.DEFAULT,
        token.address,
        DEFAULT_LIMIT_PER_SEND,
        feeWallet.address,
        DEFAULT_FEE_SEND,
        DEFAULT_FEE_FULFILL,
        deployer.address,
        [relayer.address],
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      ]
    )

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, createBridgeData2)

    await multiSigWallet.connect(relayer).approveTransaction(2)
    const bridgeAddr2 = await bridgeFactory.getBridgeByToken(token.address, 1)
    const bridge2 = BridgeAssistTransferUpgradeable__factory.connect(
      bridgeAddr2,
      ethers.provider
    )
    await bridgeSetup(bridge2, deployer, AllBridgeTypes.DEFAULT)

    const tx = {
      fromUser: nearAddress,
      toUser: user.address,
      amount: '10'.toBigNumber(9),
      fromChain: nearChain,
      nonce: '0'.toBigNumber(),
    }

    // sign by relayer transaction
    const signature = await signHashedTransaction(relayer, tx, CHAIN_ID, bridge1.address)
    await expect(bridge1.connect(user).fulfill(tx, [signature])).not.reverted
    await expect(bridge2.connect(user).fulfill(tx, [signature])).revertedWith(
      ERROR.WrongSignature
    )
  })
})
