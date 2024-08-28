import { ethers } from 'hardhat'
import { expect } from 'chai'

import { deploy, useContracts } from '@/test'
import { BigNumber, BigNumberish, Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  BridgeAssistTransferUpgradeable__factory,
  BridgeAssistCircleMintUpgradeable__factory,
} from '@/typechain'
import {
  CIRCLETOKENBYTECODE,
  DEFAULT_FEE_FULFILL,
  DEFAULT_FEE_SEND,
  DEFAULT_LIMIT_PER_SEND,
  DEFAULT_RELAYER_CONSENSUS_THRESHOLD,
} from '../utils/constants'
import { AllBridgeTypes, bridgeSetup } from '../utils/utils'
import { signHashedTransaction } from '../utils/eip712'
import { BridgeType } from './BridgeFactoryAsset.test'
import { BridgeFactoryErrors } from '../utils/errors'
import ABI from '../../scripts/abi.json'

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

describe('BridgeAssistCircleStandard contract', () => {
  // let circleToken: Contract
  beforeEach(async () => {
    const [deployer] = await ethers.getSigners()
    await deploy()
    // const factory = new ethers.ContractFactory(ABI.abi, CIRCLETOKENBYTECODE, deployer)
    // circleToken = await factory.deploy()

    // await circleToken.deployed()

    // console.log('hjhghhg')

    // await circleToken.initialize(
    //   'TEST USDC',
    //   'USDC',
    //   'USD',
    //   6,
    //   deployer.address,
    //   deployer.address,
    //   deployer.address,
    //   deployer.address
    // )
    // console.log('high')
    // // await circleToken.initializeV2('USDC')
    // console.log(await circleToken.decimals())
  })
  it('constructor requires', async function () {
    const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()
    const { bridgeFactory, multiSigWallet, circleToken } = await useContracts()
    const zero = ethers.constants.AddressZero

    const tokenZeroData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.CIRCLEMINTBURN,
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
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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
      BridgeType.CIRCLEMINTBURN,
      circleToken.address,
      ethers.utils.parseEther('100'),
      deployer.address,
      0,
      0,
      deployer.address,
      [relayer.address],
      0,
    ])
    const NOfNData = bridgeFactory.interface.encodeFunctionData('createBridgeAssist', [
      BridgeType.CIRCLEMINTBURN,
      circleToken.address,
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
    const { bridgeCircle, circleToken } = await useContracts()
    const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

    await expect(
      bridgeCircle
        .connect(deployer)
        .initialize(
          circleToken.address,
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
    const {  bridgeFactory, multiSigWallet, circleToken } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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

    const bridgeAddr = await bridgeFactory.getBridgeByToken(circleToken.address, 0)
    const bridgeCircle = BridgeAssistCircleMintUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeCircle, deployer, AllBridgeTypes.CIRCLEMINTBURN, circleToken)

    const bridgeAmountBefore = await circleToken.balanceOf(bridgeCircle.address)
    const exchangeRate = await bridgeCircle.exchangeRateFrom(
      ethers.utils.formatBytes32String(nearChain)
    )
    const amount = '100'.toBigNumber(18)

    await expect(
      bridgeCircle.connect(user).send(exchangeRate, nearAddress, nearChain)
    ).to.be.revertedWith(ERROR.AmountTooSmall)

    await expect(
        bridgeCircle.connect(user).send(0, nearAddress, nearChain)
    ).to.be.revertedWith(ERROR.ZeroAmount)
    await expect(bridgeCircle.connect(user).send(amount, '', nearChain)).to.be.revertedWith(
      ERROR.EmptyToUser
    )
    await expect(
        bridgeCircle.connect(user).send(amount, 'somechainusername', 'UNKNOWN_CHAIN')
    ).to.be.revertedWith(ERROR.UnknownChain)
    await expect(
        bridgeCircle.connect(user).send(amount.sub(1), 'someuser', 'AVAX')
    ).revertedWith('Amount is not divisible by exchange rate')

    // send tokens to user
    await circleToken.connect(deployer).transfer(user.address, amount)

    await bridgeCircle.connect(deployer).setFee(50, 0)
    const userBalanceBefore = await circleToken.balanceOf(user.address)
    const feeBalanceBefore = await circleToken.balanceOf(feeWallet.address)

    await bridgeCircle.connect(user).send(amount, nearAddress, nearChain)

    expect(await circleToken.balanceOf(user.address)).eq(userBalanceBefore.sub(amount))
    expect(await circleToken.balanceOf(feeWallet.address)).eq(
      feeBalanceBefore.add(amount.mul(50).div(10000))
    )

    const transactions = await bridgeCircle.getUserTransactions(user.address.toLowerCase())
    const tx = transactions[0]

    expect(tx.fromUser.toLowerCase()).eq(user.address.toLowerCase())
    expect(tx.toUser).eq(nearAddress)
    expect(tx.amount).eq(amount.sub(amount.mul(50).div(10000)))
    expect(tx.fromChain).eq(evmChain)
    expect(tx.toChain).eq(nearChain)
    expect(tx.nonce).eq(0)
    expect(await circleToken.balanceOf(user.address)).eq(0)
    expect(await circleToken.balanceOf(bridgeCircle.address)).eq(bridgeAmountBefore)
    expect(await bridgeCircle.getUserTransactionsAmount(user.address)).to.eq(1)

    expect(await bridgeCircle.getUserTransactionsSlice(user.address, 0, 1)).is.deep.equal([
      tx,
    ])
    expect(bridgeCircle.getUserTransactionsSlice(user.address, 1, 1)).to.be.revertedWith(
      ERROR.BadOffsetLimit
    )

    expect(await bridgeCircle.nonce()).eq(1)
  })
  it('should fulfill tokens from bridgeMint preventing double-spend', async () => {
    const {  bridgeFactory, multiSigWallet, circleToken } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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

    const bridgeAddr = await bridgeFactory.getBridgeByToken(circleToken.address, 0)
    const bridgeCircle = BridgeAssistCircleMintUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeCircle, deployer, AllBridgeTypes.CIRCLEMINTBURN, circleToken)

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
      bridgeCircle.address
    )
    const fakeSignature = await signHashedTransaction(
      deployer,
      tx,
      CHAIN_ID,
      bridgeCircle.address
    )

    await expect(
        bridgeCircle.connect(user).fulfill(wrongFromChainTx, [signature])
    ).revertedWith(ERROR.WrongFromChain)

    await expect(bridgeCircle.connect(user).fulfill(tx, [fakeSignature])).revertedWith(
      ERROR.WrongSignature
    )
    await expect(bridgeCircle.connect(user).fulfill(tx, ['0x'])).revertedWith(
      'Not enough relayers'
    )
    await expect(bridgeCircle.connect(user).fulfill(tx, [])).revertedWith(
      'Bad signatures length'
    )
    await bridgeCircle.connect(user).fulfill(tx, [signature])

    // no fee withdrawing in this test cause we hadn't setuped it yet
    expect(await circleToken.balanceOf(user.address)).eq(tx.amount)

    await expect(bridgeCircle.connect(user).fulfill(tx, [signature])).revertedWith(
      ERROR.FulfilledSignature
    )
  })
  it('multiple users test', async () => {
    const {  bridgeFactory, multiSigWallet, circleToken } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator, user1, user2] =
      await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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

    const bridgeAddr = await bridgeFactory.getBridgeByToken(circleToken.address, 0)
    const bridgeCircle = BridgeAssistCircleMintUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeCircle, deployer, AllBridgeTypes.MINT, circleToken)

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
      bridgeCircle.address
    )
    const signature1 = await signHashedTransaction(
      relayer,
      tx1,
      CHAIN_ID,
      bridgeCircle.address
    )
    const signature2 = await signHashedTransaction(
      relayer,
      tx2,
      CHAIN_ID,
      bridgeCircle.address
    )

    await bridgeCircle.connect(user).fulfill(tx, [signature])
    await bridgeCircle.connect(user1).fulfill(tx1, [signature1])
    await bridgeCircle.connect(user2).fulfill(tx2, [signature2])

    // no fee withdrawing in this test cause we hadn't setuped it yet
    expect(await circleToken.balanceOf(user.address)).eq(tx.amount)
  })
  it('should take proper fee on fulfill and prevent double-spend', async () => {
    const { bridgeFactory, multiSigWallet, circleToken } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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

    const bridgeAddr = await bridgeFactory.getBridgeByToken(circleToken.address, 0)
    const bridgeCircle = BridgeAssistCircleMintUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeCircle, deployer, AllBridgeTypes.CIRCLEMINTBURN, circleToken)

    const tx = {
      fromUser: nearAddress,
      toUser: user.address.toLowerCase(),
      amount: BigNumber.from(10),
      timestamp: BigNumber.from(666),
      fromChain: nearChain,
      toChain: evmChain,
      nonce: BigNumber.from(0),
    }

    await bridgeCircle.connect(deployer).setFee(feePercent, feePercent)

    // const signature = await relayer.signMessage(ethers.utils.arrayify(hashedData))
    const signature = await signHashedTransaction(
      relayer,
      tx,
      CHAIN_ID,
      bridgeCircle.address
    )

    await bridgeCircle.connect(user).fulfill(tx, [signature])

    expect(await circleToken.balanceOf(user.address)).eq(
      tx.amount.sub(tx.amount.mul(feePercent).div(10000))
    )
    expect(await circleToken.balanceOf(feeWallet.address)).eq(
      tx.amount.mul(feePercent).div(10000)
    )

    await expect(bridgeCircle.connect(user).fulfill(tx, [signature])).revertedWith(
      ERROR.FulfilledSignature
    )
  })
  it('should not send over the limit', async () => {
    const { bridgeFactory, multiSigWallet, circleToken } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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

    const bridgeAddr = await bridgeFactory.getBridgeByToken(circleToken.address, 0)
    const bridgeCircle = BridgeAssistCircleMintUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeCircle, deployer, AllBridgeTypes.CIRCLEMINTBURN, circleToken)

    // send tokens to user
    const amount = '100'.toBigNumber()
    await circleToken.connect(deployer).transfer(user.address, amount)
    await bridgeCircle.connect(deployer).setFee(feePercent, feePercent)

    await bridgeCircle.connect(user).send(amount, nearAddress, nearChain)
    await expect(
        bridgeCircle
        .connect(user)
        .send(amount.add('1'.toBigNumber(9)), nearAddress, nearChain)
    ).revertedWith(ERROR.Limit)
  })
  it('should withdraw, pause, set chains, set parameters, set relayers and prevent using incorrect values', async () => {
    const { bridgeFactory, multiSigWallet, circleToken } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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

    const bridgeAddr = await bridgeFactory.getBridgeByToken(circleToken.address, 0)
    const bridgeCircle = BridgeAssistCircleMintUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeCircle, deployer, AllBridgeTypes.CIRCLEMINTBURN, circleToken)

    await expect(bridgeCircle.connect(user).setFee(20, 20)).reverted
    await expect(bridgeCircle.connect(deployer).setFee(0, 0)).revertedWith(ERROR.FeeRepeat)
    await expect(bridgeCircle.connect(deployer).setFee(10000, 10000)).revertedWith(
      ERROR.FeeToHigh
    )
    await expect(bridgeCircle.connect(deployer).setFee(0, 10000)).revertedWith(
      ERROR.FeeToHigh
    )

    await expect(
        bridgeCircle.connect(deployer).setFeeWallet(feeWallet.address)
    ).revertedWith(ERROR.FeeWalletRepeat)
    await expect(
        bridgeCircle.connect(deployer).setFeeWallet(ethers.constants.AddressZero)
    ).revertedWith(ERROR.ZeroAddressFeeWallet)
    await expect(bridgeCircle.connect(user).setFeeWallet(deployer.address)).reverted
    await bridgeCircle.connect(deployer).setFeeWallet(deployer.address)
    expect(await bridgeCircle.feeWallet()).eq(deployer.address)

    await expect(
        bridgeCircle.connect(deployer).setLimitPerSend(ethers.utils.parseEther('100'))
    ).revertedWith(ERROR.LimitPerSendRepeat)
    await expect(bridgeCircle.connect(user).setLimitPerSend('20000'.toBigNumber(9)))
      .reverted
    await bridgeCircle.connect(deployer).setLimitPerSend('20000'.toBigNumber(9))
    expect(await bridgeCircle.limitPerSend()).eq('20000'.toBigNumber(9))

    await circleToken.connect(deployer).transfer(bridgeCircle.address, 50)
    const bb = await circleToken.balanceOf(deployer.address)
    // await expect(
    //   bridgeMint.connect(user).withdraw(assetToken.address, deployer.address, 50)
    // ).reverted
    // await expect(
    //   bridgeMint
    //     .connect(deployer)
    //     .withdraw(assetToken.address, ethers.constants.AddressZero, 50)
    // ).revertedWith('To: zero address')
    // await expect(
    //   bridgeMint.connect(deployer).withdraw(assetToken.address, deployer.address, 0)
    // ).revertedWith('Amount: zero')
    // await bridgeMint.connect(deployer).withdraw(assetToken.address, deployer.address, 50)
    // expect(await assetToken.balanceOf(deployer.address)).eq(bb.add(50))

    await expect(
        bridgeCircle.connect(deployer).addChains(['AAA'], [1337])
    ).to.be.revertedWith(ERROR.UnderOverFlow)
    await expect(
        bridgeCircle.connect(deployer).addChains(['NEAR'], [0])
    ).to.be.revertedWith(ERROR.ChainAlreadyInList)
    await expect(
        bridgeCircle.connect(deployer).addChains(['UNKNOWN'], [0, 0])
    ).to.be.revertedWith(ERROR.BadInput)
    await expect(
        bridgeCircle.connect(deployer).removeChains(['UNKNOWN'])
    ).to.be.revertedWith(ERROR.ChainNotInList)
    await expect(bridgeCircle.connect(user).addChains([nearChain], [0])).reverted
    await expect(bridgeCircle.connect(user).removeChains(['AVAX'])).reverted

    expect(await bridgeCircle.supportedChainList()).deep.eq([
      ethers.utils.formatBytes32String(nearChain),
      ethers.utils.formatBytes32String('AVAX'),
    ])
    await bridgeCircle.connect(deployer).removeChains(['AVAX'])
    expect(await bridgeCircle.supportedChainList()).deep.eq([
      ethers.utils.formatBytes32String(nearChain),
    ])
    await expect(
        bridgeCircle.connect(deployer).addChains(['AVAX'], [5])
    ).to.be.revertedWith(ERROR.ExchangeRateModified)

    const nearRate = await bridgeCircle.exchangeRateFrom(
      ethers.utils.formatBytes32String(nearChain)
    )
    await bridgeCircle.connect(deployer).removeChains([nearChain])
    await bridgeCircle.connect(deployer).addChains([nearChain], [0])

    await expect(bridgeCircle.connect(user).pause()).reverted
    await bridgeCircle.connect(deployer).pause()
    // send tokens to user
    const amount = '10'.toBigNumber()
    await circleToken.connect(deployer).transfer(user.address, amount)
    await circleToken.connect(user).approve(bridgeCircle.address, amount)
    await expect(
        bridgeCircle.connect(user).send(amount, nearAddress, nearChain)
    ).revertedWith(ERROR.Paused)
    await expect(
        bridgeCircle.connect(user).fulfill(
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
    await expect(bridgeCircle.connect(deployer).pause()).revertedWith(ERROR.Paused)

    await bridgeCircle.connect(deployer).unpause()
    await bridgeCircle.connect(user).send('10000'.toBigNumber(9), nearAddress, nearChain)
    await expect(bridgeCircle.connect(deployer).unpause()).revertedWith(ERROR.NotPaused)

    await expect(bridgeCircle.connect(deployer).setRelayers([], 0)).to.be.revertedWith(
      ERROR.NoRelayers
    )
    await expect(
        bridgeCircle.connect(deployer).setRelayers(Array(101).fill(deployer.address), 0)
    ).to.be.revertedWith(ERROR.TooManyRelayers)
    await expect(
        bridgeCircle
        .connect(deployer)
        .setRelayers([user.address, deployer.address, user.address], 1)
    ).to.be.revertedWith(ERROR.DuplicateRelayers)
    await expect(
        bridgeCircle.connect(deployer).setRelayers([deployer.address], 0)
    ).to.be.revertedWith(ERROR.ZeroOfN)
    await expect(
        bridgeCircle.connect(deployer).setRelayers([deployer.address], 2)
    ).to.be.revertedWith(ERROR.NOfN)
    await expect(bridgeCircle.connect(user).setRelayers([deployer.address], 1)).reverted

    await bridgeCircle.connect(deployer).setRelayers([deployer.address], 1)
    expect(await bridgeCircle.relayerConsensusThreshold()).to.eq(1)
    expect(await bridgeCircle.relayersLength()).to.eq(1)
    expect(await bridgeCircle.relayers(0)).to.eq(deployer.address)
    expect(await bridgeCircle.getRelayers()).to.deep.eq([deployer.address])
  })
  it('the signature from bridgeDefault is invalid on other bridgeDefault', async () => {
    const { bridgeFactory, multiSigWallet, circleToken } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData1 = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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
      .createTransaction(bridgeFactory.address, createBridgeData1)

    await multiSigWallet.connect(relayer).approveTransaction(1)

    const bridgeAddr1 = await bridgeFactory.getBridgeByToken(circleToken.address, 0)
    const bridge1 = BridgeAssistCircleMintUpgradeable__factory.connect(
      bridgeAddr1,
      ethers.provider
    )
    await bridgeSetup(bridge1, deployer, AllBridgeTypes.CIRCLEMINTBURN, circleToken)

    const createBridgeData2 = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.CIRCLEMINTBURN,
        circleToken.address,
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
      .createTransaction(bridgeFactory.address, createBridgeData2)

    await multiSigWallet.connect(relayer).approveTransaction(2)

    const bridgeAddr2 = await bridgeFactory.getBridgeByToken(circleToken.address, 1)
    const bridge2 = BridgeAssistCircleMintUpgradeable__factory.connect(
      bridgeAddr2,
      ethers.provider
    )
    await bridgeSetup(bridge2, deployer, AllBridgeTypes.CIRCLEMINTBURN, circleToken)

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
