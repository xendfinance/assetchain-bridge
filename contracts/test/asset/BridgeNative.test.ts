import { ethers } from 'hardhat'
import { expect } from 'chai'

import { deploy, useContracts } from '@/test'
import { BigNumber, BigNumberish } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  BridgeAssistTransferUpgradeable__factory,
  BridgeAssistNativeUpgradeable__factory,
  OldBridgeAssist__factory,
} from '@/typechain'
import {
  DEFAULT_FEE_FULFILL,
  DEFAULT_FEE_SEND,
  DEFAULT_LIMIT_PER_SEND,
  DEFAULT_RELAYER_CONSENSUS_THRESHOLD,
} from '../utils/constants'
import { AllBridgeTypes, bridgeSetup } from '../utils/utils'
import { signHashedTransaction } from '../utils/eip712'
import { BridgeType, NATIVE_TOKEN } from './BridgeFactoryAsset.test'

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

describe('BridgeAssistNative contract', () => {
  beforeEach(async () => {
    await deploy()
  })
  it('constructor requires', async function () {
    const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()
    const { bridgeFactory, assetToken, multiSigWallet } = await useContracts()

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
        BridgeType.NATIVE,
        NATIVE_TOKEN,
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
        BridgeType.NATIVE,
        NATIVE_TOKEN,
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
        BridgeType.NATIVE,
        NATIVE_TOKEN,
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
        BridgeType.NATIVE,
        NATIVE_TOKEN,
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
        BridgeType.NATIVE,
        NATIVE_TOKEN,
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
        BridgeType.NATIVE,
        NATIVE_TOKEN,
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
        BridgeType.NATIVE,
        NATIVE_TOKEN,
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
      BridgeType.NATIVE,
      NATIVE_TOKEN,
      ethers.utils.parseEther('100'),
      deployer.address,
      0,
      0,
      deployer.address,
      [relayer.address],
      0,
    ])
    const NOfNData = bridgeFactory.interface.encodeFunctionData('createBridgeAssist', [
      BridgeType.NATIVE,
      NATIVE_TOKEN,
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

    const validCreateBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.NATIVE,
        NATIVE_TOKEN,
        0,
        deployer.address,
        0,
        0,
        deployer.address,
        [relayer.address],
        1,
      ]
    )

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, validCreateBridgeData)
    await multiSigWallet.connect(relayer).approveTransaction(11)

    const bridgeAddr = await bridgeFactory.getBridgeByToken(NATIVE_TOKEN, 0)

    const bridgeNative = BridgeAssistNativeUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeNative, deployer, AllBridgeTypes.NATIVE)
  })
  it('Re-initialize should revert', async () => {
    const { bridgeNative, token } = await useContracts()
    const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

    await expect(
      bridgeNative
        .connect(deployer)
        .initialize(
          NATIVE_TOKEN,
          DEFAULT_LIMIT_PER_SEND,
          feeWallet.address,
          0,
          DEFAULT_FEE_FULFILL,
          bridgeCreator.address,
          [relayer.address],
          DEFAULT_RELAYER_CONSENSUS_THRESHOLD
        )
    ).revertedWith('Initializable: contract is already initialized')
  })

  it('should fulfill native from bridgeDefault preventing double-spend', async () => {
    const { bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.NATIVE,
        NATIVE_TOKEN,
        0,
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

    const bridgeAddr = await bridgeFactory.getBridgeByToken(NATIVE_TOKEN, 0)
    const bridgeNative = BridgeAssistNativeUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeNative, deployer, AllBridgeTypes.NATIVE)

    const tx = {
      fromUser: nearAddress,
      toUser: user.address,
      amount: '10'.toBigNumber(18),
      fromChain: nearChain,
      nonce: '0'.toBigNumber(),
    }

    const wrongFromChainTx = {
      fromUser: nearAddress,
      toUser: user.address,
      amount: '10'.toBigNumber(18),
      fromChain: 'UNKNOWN CHAIN',
      nonce: '0'.toBigNumber(),
    }

    // sign by relayer transaction

    const signature = await signHashedTransaction(
      relayer,
      tx,
      CHAIN_ID,
      bridgeNative.address
    )
    const fakeSignature = await signHashedTransaction(
      deployer,
      tx,
      CHAIN_ID,
      bridgeNative.address
    )

    await expect(
      bridgeNative
        .connect(user)
        .fulfill(wrongFromChainTx, [signature], { maxFeePerGas: 0 })
    ).revertedWith(ERROR.WrongFromChain)

    await expect(
      bridgeNative.connect(user).fulfill(tx, [fakeSignature], { maxFeePerGas: 0 })
    ).revertedWith(ERROR.WrongSignature)
    await expect(
      bridgeNative.connect(user).fulfill(tx, ['0x'], { maxFeePerGas: 0 })
    ).revertedWith('Not enough relayers')
    await expect(
      bridgeNative.connect(user).fulfill(tx, [], { maxFeePerGas: 0 })
    ).revertedWith('Bad signatures length')

    const bridgeBalanceBefore = await ethers.provider.getBalance(bridgeNative.address)
    const userBalanceBefore = await ethers.provider.getBalance(user.address)

    await bridgeNative.connect(user).fulfill(tx, [signature], { maxFeePerGas: 0 })

    expect(await ethers.provider.getBalance(user.address)).eq(
      userBalanceBefore.add(tx.amount)
    )
    expect(await ethers.provider.getBalance(bridgeNative.address)).eq(
      bridgeBalanceBefore.sub(tx.amount)
    )

    await expect(
      bridgeNative.connect(user).fulfill(tx, [signature], { maxFeePerGas: 0 })
    ).revertedWith(ERROR.FulfilledSignature)
  })
  it('multiple users test', async () => {
    const { bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator, user1, user2] =
      await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.NATIVE,
        NATIVE_TOKEN,
        0,
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

    const bridgeAddr = await bridgeFactory.getBridgeByToken(NATIVE_TOKEN, 0)
    const bridgeNative = BridgeAssistNativeUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeNative, deployer, AllBridgeTypes.NATIVE)

    const tx = {
      fromUser: nearAddress,
      toUser: user.address,
      amount: '10'.toBigNumber(18),
      fromChain: nearChain,
      nonce: '0'.toBigNumber(),
    }

    const tx1 = {
      fromUser: nearAddress1,
      toUser: user1.address,
      amount: '777'.toBigNumber(18),
      fromChain: nearChain,
      nonce: '1'.toBigNumber(),
    }

    const tx2 = {
      fromUser: nearAddress2,
      toUser: user2.address,
      amount: '999'.toBigNumber(18),
      fromChain: nearChain,
      nonce: '2'.toBigNumber(),
    }

    // sign by relayer transaction

    const signature = await signHashedTransaction(
      relayer,
      tx,
      CHAIN_ID,
      bridgeNative.address
    )
    const signature1 = await signHashedTransaction(
      relayer,
      tx1,
      CHAIN_ID,
      bridgeNative.address
    )
    const signature2 = await signHashedTransaction(
      relayer,
      tx2,
      CHAIN_ID,
      bridgeNative.address
    )

    const userBalanceBefore = await ethers.provider.getBalance(user.address)

    await bridgeNative.connect(user).fulfill(tx, [signature], { maxFeePerGas: 0 })
    await bridgeNative.connect(user1).fulfill(tx1, [signature1], { maxFeePerGas: 0 })
    await bridgeNative.connect(user2).fulfill(tx2, [signature2], { maxFeePerGas: 0 })

    // no fee withdrawing in this test cause we hadn't setuped it yet
    expect(await ethers.provider.getBalance(user.address)).eq(
      userBalanceBefore.add(tx.amount)
    )
  })
  it('should take proper fee on fulfill and prevent double-spend', async () => {
    const { bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.NATIVE,
        NATIVE_TOKEN,
        0,
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

    const bridgeAddr = await bridgeFactory.getBridgeByToken(NATIVE_TOKEN, 0)
    const bridgeNative = BridgeAssistNativeUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeNative, deployer, AllBridgeTypes.NATIVE)

    const tx = {
      fromUser: nearAddress,
      toUser: user.address.toLowerCase(),
      amount: BigNumber.from(10).pow(18),
      fromChain: nearChain,
      nonce: BigNumber.from(0),
    }

    await bridgeNative.connect(deployer).setFee(1000, 1000)

    // const signature = await relayer.signMessage(ethers.utils.arrayify(hashedData))
    const signature = await signHashedTransaction(
      relayer,
      tx,
      CHAIN_ID,
      bridgeNative.address
    )

    const feeWalletBalanceBefore = await ethers.provider.getBalance(feeWallet.address)
    const userBalanceBefore = await ethers.provider.getBalance(user.address)
    const bridgeBalanceBefore = await ethers.provider.getBalance(bridgeNative.address)

    await bridgeNative.connect(user).fulfill(tx, [signature], { maxFeePerGas: 0 })

    const fee = tx.amount.mul(feePercent).div(10000)

    expect(await ethers.provider.getBalance(user.address)).eq(
      userBalanceBefore.add(tx.amount.sub(fee))
    )
    expect(await ethers.provider.getBalance(feeWallet.address)).eq(
      feeWalletBalanceBefore.add(fee)
    )
    expect(await ethers.provider.getBalance(bridgeNative.address)).eq(
      bridgeBalanceBefore.sub(tx.amount)
    )

    await expect(
      bridgeNative.connect(user).fulfill(tx, [signature], { maxFeePerGas: 0 })
    ).revertedWith(ERROR.FulfilledSignature)
  })
  it('should withdraw, pause, set chains, set parameters, set relayers and prevent using incorrect values', async () => {
    const { bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.NATIVE,
        NATIVE_TOKEN,
        0,
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

    const bridgeAddr = await bridgeFactory.getBridgeByToken(NATIVE_TOKEN, 0)
    const bridgeNative = BridgeAssistNativeUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridgeNative, deployer, AllBridgeTypes.NATIVE)

    await expect(bridgeNative.connect(user).setFee(20, 20)).reverted
    await expect(bridgeNative.connect(deployer).setFee(0, 0)).revertedWith(
      ERROR.FeeRepeat
    )
    await expect(bridgeNative.connect(deployer).setFee(10000, 10000)).revertedWith(
      ERROR.FeeToHigh
    )

    await expect(
      bridgeNative.connect(deployer).setFeeWallet(feeWallet.address)
    ).revertedWith(ERROR.FeeWalletRepeat)
    await expect(
      bridgeNative.connect(deployer).setFeeWallet(ethers.constants.AddressZero)
    ).revertedWith(ERROR.ZeroAddressFeeWallet)
    await expect(bridgeNative.connect(user).setFeeWallet(deployer.address)).reverted
    await bridgeNative.connect(deployer).setFeeWallet(deployer.address)
    expect(await bridgeNative.feeWallet()).eq(deployer.address)

    // const bb = await ethers.provider.getBalance(deployer.address)
    // await expect(bridgeNative.connect(user).withdrawNative(deployer.address, 50)).reverted
    // await expect(bridgeNative
    //   .connect(deployer)
    //   .withdrawNative(ethers.constants.AddressZero, 50, { maxFeePerGas: 0 })).revertedWith('To: zero address')
    // await expect(bridgeNative
    //   .connect(deployer)
    //   .withdrawNative(deployer.address, 0, { maxFeePerGas: 0 })).revertedWith('Amount: zero')
    // await bridgeNative
    //   .connect(deployer)
    //   .withdrawNative(deployer.address, 50, { maxFeePerGas: 0 })
    // expect(await ethers.provider.getBalance(deployer.address)).eq(bb.add(50))

    await expect(
      bridgeNative.connect(deployer).addChains(['AAA'], [1337])
    ).to.be.revertedWith(ERROR.UnderOverFlow)
    await expect(
      bridgeNative.connect(deployer).addChains(['NEAR'], [0])
    ).to.be.revertedWith(ERROR.ChainAlreadyInList)
    await expect(
      bridgeNative.connect(deployer).addChains(['UNKNOWN'], [0, 0])
    ).to.be.revertedWith(ERROR.BadInput)
    await expect(
      bridgeNative.connect(deployer).removeChains(['UNKNOWN'])
    ).to.be.revertedWith(ERROR.ChainNotInList)
    await expect(bridgeNative.connect(user).addChains([nearChain], [0])).reverted
    await expect(bridgeNative.connect(user).removeChains(['AVAX'])).reverted

    expect(await bridgeNative.supportedChainList()).deep.eq([
      ethers.utils.formatBytes32String(nearChain),
      ethers.utils.formatBytes32String('AVAX'),
    ])
    await bridgeNative.connect(deployer).removeChains(['AVAX'])
    expect(await bridgeNative.supportedChainList()).deep.eq([
      ethers.utils.formatBytes32String(nearChain),
    ])
    await expect(
      bridgeNative.connect(deployer).addChains(['AVAX'], [5])
    ).to.be.revertedWith(ERROR.ExchangeRateModified)

    const nearRate = await bridgeNative.exchangeRateFrom(
      ethers.utils.formatBytes32String(nearChain)
    )
    await bridgeNative.connect(deployer).removeChains([nearChain])
    await bridgeNative.connect(deployer).addChains([nearChain], [0])

    await expect(bridgeNative.connect(user).pause()).reverted
    await bridgeNative.connect(deployer).pause()
    expect(await bridgeNative.paused()).true

    await expect(
      bridgeNative.connect(user).fulfill(
        {
          fromUser: nearAddress,
          toUser: user.address,
          amount: '10'.toBigNumber(9),
          fromChain: nearChain,
          nonce: '0'.toBigNumber(),
        },
        ['0x'],
        { maxFeePerGas: 0 }
      )
    ).revertedWith(ERROR.Paused)
    await expect(bridgeNative.connect(deployer).pause()).revertedWith(ERROR.Paused)

    await bridgeNative.connect(deployer).unpause()
    await expect(bridgeNative.connect(deployer).unpause()).revertedWith(ERROR.NotPaused)

    await expect(bridgeNative.connect(deployer).setRelayers([], 0)).to.be.revertedWith(
      ERROR.NoRelayers
    )
    await expect(
      bridgeNative.connect(deployer).setRelayers(Array(101).fill(deployer.address), 0)
    ).to.be.revertedWith(ERROR.TooManyRelayers)
    await expect(
      bridgeNative
        .connect(deployer)
        .setRelayers([user.address, deployer.address, user.address], 1)
    ).to.be.revertedWith(ERROR.DuplicateRelayers)
    await expect(
      bridgeNative.connect(deployer).setRelayers([deployer.address], 0)
    ).to.be.revertedWith(ERROR.ZeroOfN)
    await expect(
      bridgeNative.connect(deployer).setRelayers([deployer.address], 2)
    ).to.be.revertedWith(ERROR.NOfN)
    await expect(bridgeNative.connect(user).setRelayers([deployer.address], 1)).reverted

    await bridgeNative.connect(deployer).setRelayers([deployer.address], 1)
    expect(await bridgeNative.relayerConsensusThreshold()).to.eq(1)
    expect(await bridgeNative.relayersLength()).to.eq(1)
    expect(await bridgeNative.relayers(0)).to.eq(deployer.address)
    expect(await bridgeNative.getRelayers()).to.deep.eq([deployer.address])
  })
  it('the signature from bridgeNative is invalid on other bridgeNative', async () => {
    const { bridgeFactory, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData1 = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.NATIVE,
        NATIVE_TOKEN,
        0,
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

    const bridgeAddr1 = await bridgeFactory.getBridgeByToken(NATIVE_TOKEN, 0)
    const bridge1 = BridgeAssistNativeUpgradeable__factory.connect(
      bridgeAddr1,
      ethers.provider
    )
    await bridgeSetup(bridge1, deployer, AllBridgeTypes.NATIVE)

    const createBridgeData2 = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.NATIVE,
        NATIVE_TOKEN,
        0,
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

    const bridgeAddr2 = await bridgeFactory.getBridgeByToken(NATIVE_TOKEN, 1)
    const bridge2 = BridgeAssistNativeUpgradeable__factory.connect(
      bridgeAddr2,
      ethers.provider
    )
    await bridgeSetup(bridge2, deployer, AllBridgeTypes.NATIVE)

    const tx = {
      fromUser: nearAddress,
      toUser: user.address,
      amount: '10'.toBigNumber(9),
      fromChain: nearChain,
      nonce: '0'.toBigNumber(),
    }

    // sign by relayer transaction
    const signature = await signHashedTransaction(relayer, tx, CHAIN_ID, bridge1.address)
    await expect(bridge1.connect(user).fulfill(tx, [signature], { maxFeePerGas: 0 })).not
      .reverted
    await expect(
      bridge2.connect(user).fulfill(tx, [signature], { maxFeePerGas: 0 })
    ).revertedWith(ERROR.WrongSignature)
  })
  it('send native should fail due to invalid receiver', async () => {
    const { bridgeFactory, assetToken, multiSigWallet } = await useContracts()
    const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

    const createBridgeData = bridgeFactory.interface.encodeFunctionData(
      'createBridgeAssist',
      [
        BridgeType.NATIVE,
        NATIVE_TOKEN,
        0,
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

    const bridgeAddr = await bridgeFactory.getBridgeByToken(NATIVE_TOKEN, 0)

    const bridge = BridgeAssistNativeUpgradeable__factory.connect(
      bridgeAddr,
      ethers.provider
    )
    await bridgeSetup(bridge, deployer, AllBridgeTypes.NATIVE)

    const oldBridgeFactory: OldBridgeAssist__factory = await ethers.getContractFactory(
      'OldBridgeAssist',
      deployer
    )
    const bridgeDeployed = await oldBridgeFactory
      .connect(deployer)
      .deploy(
        assetToken.address,
        ethers.utils.parseEther('100'),
        feeWallet.address,
        0,
        0,
        deployer.address,
        [relayer.address],
        1
      )

    const tx = {
      fromUser: nearAddress,
      toUser: bridgeDeployed.address,
      amount: '10'.toBigNumber(9),
      fromChain: nearChain,
      nonce: '0'.toBigNumber(),
    }

    // sign by relayer transaction
    const signature = await signHashedTransaction(relayer, tx, CHAIN_ID, bridge.address)
    await expect(
      bridge.connect(user).fulfill(tx, [signature], { maxFeePerGas: 0 })
    ).revertedWith('Send funds error: user')

    const tx2 = {
      fromUser: nearAddress,
      toUser: user.address,
      amount: '10'.toBigNumber(9),
      fromChain: nearChain,
      nonce: '0'.toBigNumber(),
    }

    // sign by relayer transaction
    const signature2 = await signHashedTransaction(relayer, tx2, CHAIN_ID, bridge.address)

    await bridge.connect(deployer).setFee(100, 100)
    await bridge.connect(deployer).setFeeWallet(bridgeDeployed.address)

    await expect(
      bridge.connect(user).fulfill(tx2, [signature2], { maxFeePerGas: 0 })
    ).revertedWith('Send funds error: fee wallet')

    // await expect(
    //   bridge.connect(deployer).withdrawNative(bridgeDeployed.address, 1)
    // ).revertedWith('Unable to send funds')
  })
  // it('send withdraw any tokens transferred to the native bridge', async () => {
  //   const { bridgeFactory, assetToken, multiSigWallet } = await useContracts()
  //   const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

  //   const createBridgeData = bridgeFactory.interface.encodeFunctionData(
  //     'createBridgeAssist',
  //     [
  //       BridgeType.NATIVE,
  //       NATIVE_TOKEN,
  //       0,
  //       feeWallet.address,
  //       DEFAULT_FEE_SEND,
  //       DEFAULT_FEE_FULFILL,
  //       deployer.address,
  //       [relayer.address],
  //       DEFAULT_RELAYER_CONSENSUS_THRESHOLD
  //     ]
  //   )

  //   await multiSigWallet.connect(deployer).createTransaction(bridgeFactory.address, createBridgeData)
  //   await multiSigWallet.connect(relayer).approveTransaction(1)

  //   const bridgeAddr = await bridgeFactory.getBridgeByToken(NATIVE_TOKEN, 0)

  //   const bridge = BridgeAssistNativeUpgradeable__factory.connect(
  //     bridgeAddr,
  //     ethers.provider
  //   )
  //   await bridgeSetup(bridge, deployer, AllBridgeTypes.NATIVE)

  //   const amount = 10
  //   await assetToken.connect(deployer).transfer(bridge.address, amount)

  //   const userBalanceBefore = await assetToken.balanceOf(deployer.address)
  //   const bridgeBalanceBefore = await assetToken.balanceOf(bridge.address)

  //   await bridge.connect(deployer).withdraw(assetToken.address, deployer.address, amount)

  //   expect(await assetToken.balanceOf(deployer.address)).eq(userBalanceBefore.add(amount))
  //   expect(await assetToken.balanceOf(bridge.address)).eq(bridgeBalanceBefore.sub(amount))

  //   // await expect(
  //   //   bridge.connect(user).withdraw(assetToken.address, deployer.address, amount)
  //   // ).reverted
  // })
  // it('unsupported functions should revert', async () => {
  //   const { bridgeFactory, assetToken, mockNative, multiSigWallet } = await useContracts()
  //   const [deployer, relayer, user, feeWallet, bridgeCreator] = await ethers.getSigners()

  //   const errorMsg = 'NOT SUPPORTED'

  //   const createBridgeData = bridgeFactory.interface.encodeFunctionData(
  //     'createBridgeAssist',
  //     [
  //       BridgeType.NATIVE,
  //       NATIVE_TOKEN,
  //       0,
  //       feeWallet.address,
  //       DEFAULT_FEE_SEND,
  //       DEFAULT_FEE_FULFILL,
  //       deployer.address,
  //       [relayer.address],
  //       DEFAULT_RELAYER_CONSENSUS_THRESHOLD,
  //     ]
  //   )

  //   await multiSigWallet
  //     .connect(deployer)
  //     .createTransaction(bridgeFactory.address, createBridgeData)
  //   await multiSigWallet.connect(relayer).approveTransaction(1)

  //   const bridgeAddr = await bridgeFactory.getBridgeByToken(NATIVE_TOKEN, 0)

  //   const bridge = BridgeAssistNativeUpgradeable__factory.connect(
  //     bridgeAddr,
  //     ethers.provider
  //   )
  //   await bridgeSetup(bridge, deployer, AllBridgeTypes.NATIVE)

  //   await expect(bridge.send(0, '', '')).revertedWith(errorMsg)
  //   await expect(bridge['setFee(uint256,uint256)'](0, 0)).revertedWith(errorMsg)
  //   await expect(bridge.setLimitPerSend(0)).revertedWith(errorMsg)
  //   await expect(
  //     mockNative.afterSend(
  //       ethers.constants.AddressZero,
  //       ethers.constants.AddressZero,
  //       0,
  //       0
  //     )
  //   ).revertedWith(errorMsg)
  // })
})
