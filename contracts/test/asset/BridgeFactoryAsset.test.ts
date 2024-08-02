import { ethers } from 'hardhat'
import { expect } from 'chai'

import { useContracts, deploy } from '@/test'
import {
  BridgeAssistMintUpgradeable__factory,
  BridgeAssistNativeUpgradeable__factory,
  BridgeFactoryUpgradeable__factory,
  MultiSigWallet__factory,
  OldBridgeAssist__factory,
} from '@/typechain'
import { accessControlError, disableInitializer } from '../utils/utils'
import {
  DEFAULT_FEE_FULFILL,
  DEFAULT_FEE_SEND,
  DEFAULT_LIMIT_PER_SEND,
  DEFAULT_RELAYER_CONSENSUS_THRESHOLD,
} from '../utils/constants'
import { BridgeFactoryErrors, ERRORS } from '../utils/errors'
import { BigNumber } from 'ethers'

export enum BridgeType {
  DEFAULT,
  MINT,
  NATIVE,
  CIRCLEMINTBURN,
}

export const NATIVE_TOKEN = '0x0000000000000000000000000000000000000001'

const GAS_LIMIT_PER_BLOCK = BigNumber.from(20_000_000)

describe('BridgeFactory contract (asset chain)', () => {
  beforeEach(async () => {
    await deploy()
  })
  describe('Initializing', () => {
    it('Should execute initializer correctly', async () => {
      const { bridgeFactory, bridgeMint, bridgeNative } = await useContracts()
      const [deployer] = await ethers.getSigners()

      expect(await bridgeFactory.bridgeAssistImplementation(BridgeType.MINT)).eq(
        bridgeMint.address
      )
      expect(await bridgeFactory.bridgeAssistImplementation(BridgeType.NATIVE)).eq(
        bridgeNative.address
      )

      const defaultAdminRole = await bridgeFactory.DEFAULT_ADMIN_ROLE()
      expect(await bridgeFactory.hasRole(defaultAdminRole, deployer.address)).true
    })
    it('Initializer should revert', async () => {
      const { bridgeMint, bridgeNative, multiSigWallet, bridgeCircle } =
        await useContracts()
      const [deployer] = await ethers.getSigners()

      const bridgeFactoryFactory: BridgeFactoryUpgradeable__factory =
        await ethers.getContractFactory('BridgeFactoryUpgradeable', deployer)

      const bridgeFactory = await bridgeFactoryFactory.connect(deployer).deploy()
      await disableInitializer(bridgeFactory.address)

      await expect(
        bridgeFactory
          .connect(deployer)
          .initialize(
            ethers.constants.AddressZero,
            bridgeMint.address,
            bridgeNative.address,
            bridgeCircle.address,
            multiSigWallet.address,
            ethers.constants.AddressZero
          )
      ).revertedWith(BridgeFactoryErrors.ZeroAddress)
      await expect(
        bridgeFactory
          .connect(deployer)
          .initialize(
            ethers.constants.AddressZero,
            bridgeMint.address,
            bridgeNative.address,
            bridgeCircle.address,
            multiSigWallet.address,
            ethers.constants.AddressZero
          )
      ).revertedWith(BridgeFactoryErrors.ZeroAddress)
    })
    it('Initializer should not revert if implementation is zero address', async () => {
      const { bridgeMint, bridgeNative, multiSigWallet } = await useContracts()
      const [deployer] = await ethers.getSigners()

      const bridgeFactoryFactory: BridgeFactoryUpgradeable__factory =
        await ethers.getContractFactory('BridgeFactoryUpgradeable', deployer)

      const bridgeFactory = await bridgeFactoryFactory.connect(deployer).deploy()
      await disableInitializer(bridgeFactory.address)

      await expect(
        bridgeFactory
          .connect(deployer)
          .initialize(
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            multiSigWallet.address,
            deployer.address
          )
      ).not.reverted
    })
    it('Creating bridge type with zero implementation should revert', async () => {
      const [deployer, user] = await ethers.getSigners()

      const bridgeFactoryFactory: BridgeFactoryUpgradeable__factory =
        await ethers.getContractFactory('BridgeFactoryUpgradeable', deployer)

      const bridgeFactory = await bridgeFactoryFactory.connect(deployer).deploy()
      await disableInitializer(bridgeFactory.address)

      const MultiSigWallet__factory =
        await ethers.getContractFactory<MultiSigWallet__factory>(
          'MultiSigWallet',
          deployer
        )

      const multiSigWallet = await MultiSigWallet__factory.deploy(
        [deployer.address, user.address],
        2,
        'Wallet'
      )

      await bridgeFactory
        .connect(deployer)
        .initialize(
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          multiSigWallet.address,
          deployer.address
        )
      const PARAM_1: any[] = [
        BridgeType.DEFAULT,
        ethers.constants.AddressZero,
        0,
        ethers.constants.AddressZero,
        0,
        0,
        ethers.constants.AddressZero,
        [],
        0,
      ]
      const BR_TYPE_INVALID_IMPLdata = bridgeFactory.interface.encodeFunctionData(
        'createBridgeAssist',
        [...PARAM_1] as any
      )

      await expect(
        bridgeFactory
          .connect(deployer)
          .createBridgeAssist(
            PARAM_1[0],
            PARAM_1[1],
            PARAM_1[2],
            PARAM_1[3],
            PARAM_1[4],
            PARAM_1[5],
            PARAM_1[6],
            PARAM_1[7],
            PARAM_1[8]
          )
      ).revertedWith(BridgeFactoryErrors.NotMultiSigWallet)

      // await multiSigWallet.connect(deployer).createTransaction(bridgeFactory.address, BR_TYPE_INVALID_IMPLdata)
      // await expect(multiSigWallet.connect(user).approveTransaction(1)).reverted
    })
    it('Re-initialize should revert', async () => {
      const { bridgeMint, bridgeNative, bridgeFactory, multiSigWallet, bridgeCircle } =
        await useContracts()
      const [deployer, user] = await ethers.getSigners()

      await expect(
        bridgeFactory
          .connect(deployer)
          .initialize(
            ethers.constants.AddressZero,
            bridgeMint.address,
            bridgeNative.address,
            bridgeCircle.address,
            multiSigWallet.address,
            user.address
          )
      ).revertedWith(ERRORS.initialized)
    })
  })
  describe('Creating bridges', () => {
    it('Should successfully create bridges', async () => {
      const { bridgeFactory, assetToken, bridgeMint, bridgeNative, multiSigWallet } =
        await useContracts()
      const [deployer, relayer, feeWallet, bridgeCreator] = await ethers.getSigners()

      const defaultAdminRole = await bridgeFactory.DEFAULT_ADMIN_ROLE()

      const bridgeAddrData = bridgeFactory.interface.encodeFunctionData(
        'createBridgeAssist',
        [
          BridgeType.MINT,
          assetToken.address,
          DEFAULT_LIMIT_PER_SEND,
          feeWallet.address,
          DEFAULT_FEE_SEND,
          DEFAULT_FEE_FULFILL,
          bridgeCreator.address,
          [relayer.address],
          DEFAULT_RELAYER_CONSENSUS_THRESHOLD,
        ]
      )

      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, bridgeAddrData)
      await multiSigWallet.connect(relayer).approveTransaction(1)

      // const bridgeAddr = await bridgeFactory
      //   .connect(bridgeCreator)
      //   .callStatic.createBridgeAssist(
      //     BridgeType.MINT,
      //     assetToken.address,
      //     DEFAULT_LIMIT_PER_SEND,
      //     feeWallet.address,
      //     DEFAULT_FEE_SEND,
      //     DEFAULT_FEE_FULFILL,
      //     bridgeCreator.address,
      //     [relayer.address],
      //     DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      //   )

      // await bridgeFactory
      //   .connect(bridgeCreator)
      //   .createBridgeAssist(
      //     BridgeType.MINT,
      //     assetToken.address,
      //     DEFAULT_LIMIT_PER_SEND,
      //     feeWallet.address,
      //     DEFAULT_FEE_SEND,
      //     DEFAULT_FEE_FULFILL,
      //     bridgeCreator.address,
      //     [relayer.address],
      //     DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      //   )
      let bridgeAddr = ''

      expect(await bridgeFactory.getCreatedBridgesLength()).eq(1)
      const createdBridgeInfo = (await bridgeFactory.getCreatedBridgesInfo(0, 1))[0]
      bridgeAddr = createdBridgeInfo.bridgeAssist
      expect(createdBridgeInfo.bridgeAssist).eq(bridgeAddr)
      expect(createdBridgeInfo.token).eq(assetToken.address)

      const createdBridgeInfoByIndex = await bridgeFactory.getCreatedBridgeInfo(0)
      expect(createdBridgeInfoByIndex.bridgeAssist).eq(bridgeAddr)
      expect(createdBridgeInfoByIndex.token).eq(assetToken.address)

      const createdBridge = BridgeAssistMintUpgradeable__factory.connect(
        bridgeAddr,
        ethers.provider
      )
      expect(await createdBridge.TOKEN()).eq(assetToken.address)
      expect(await createdBridge.limitPerSend()).eq(DEFAULT_LIMIT_PER_SEND)
      expect(await createdBridge.feeWallet()).eq(feeWallet.address)
      expect(await createdBridge.feeSend()).eq(DEFAULT_FEE_SEND)
      expect(await createdBridge.feeFulfill()).eq(DEFAULT_FEE_FULFILL)
      expect(await createdBridge.hasRole(defaultAdminRole, bridgeCreator.address)).true
      expect(await createdBridge.getRelayers()).deep.eq([relayer.address])
      expect(await createdBridge.relayerConsensusThreshold()).eq(
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      )

      const bridgeNativeData = bridgeFactory.interface.encodeFunctionData(
        'createBridgeAssist',
        [
          BridgeType.NATIVE,
          NATIVE_TOKEN,
          0,
          feeWallet.address,
          DEFAULT_FEE_SEND,
          DEFAULT_FEE_FULFILL,
          bridgeCreator.address,
          [relayer.address],
          DEFAULT_RELAYER_CONSENSUS_THRESHOLD,
        ]
      )

      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, bridgeNativeData)
      await multiSigWallet.connect(relayer).approveTransaction(2)

      let bridgeAddrNative = ''

      // const bridgeAddrNative = await bridgeFactory
      //   .connect(bridgeCreator)
      //   .callStatic.createBridgeAssist(
      //     BridgeType.NATIVE,
      //     NATIVE_TOKEN,
      //     0,
      //     feeWallet.address,
      //     DEFAULT_FEE_SEND,
      //     DEFAULT_FEE_FULFILL,
      //     bridgeCreator.address,
      //     [relayer.address],
      //     DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      //   )
      // await bridgeFactory
      //   .connect(bridgeCreator)
      //   .createBridgeAssist(
      //     BridgeType.NATIVE,
      //     NATIVE_TOKEN,
      //     0,
      //     feeWallet.address,
      //     DEFAULT_FEE_SEND,
      //     DEFAULT_FEE_FULFILL,
      //     bridgeCreator.address,
      //     [relayer.address],
      //     DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      //   )

      expect(await bridgeFactory.getCreatedBridgesLength()).eq(2)
      const createdBridgeInfo2 = (await bridgeFactory.getCreatedBridgesInfo(1, 1))[0]
      bridgeAddrNative = createdBridgeInfo2.bridgeAssist
      expect(createdBridgeInfo2.bridgeAssist).eq(bridgeAddrNative)
      expect(createdBridgeInfo2.token).eq(NATIVE_TOKEN)

      const createdBridgeInfoByIndex2 = await bridgeFactory.getCreatedBridgeInfo(1)
      expect(createdBridgeInfoByIndex2.bridgeAssist).eq(bridgeAddrNative)
      expect(createdBridgeInfoByIndex2.token).eq(NATIVE_TOKEN)

      const createdBridge2 = BridgeAssistNativeUpgradeable__factory.connect(
        bridgeAddrNative,
        ethers.provider
      )
      expect(await createdBridge2.TOKEN()).eq(NATIVE_TOKEN)
      expect(await createdBridge2.feeWallet()).eq(feeWallet.address)
      expect(await createdBridge2.feeFulfill()).eq(DEFAULT_FEE_FULFILL)
      expect(await createdBridge2.hasRole(defaultAdminRole, bridgeCreator.address)).true
      expect(await createdBridge2.getRelayers()).deep.eq([relayer.address])
      expect(await createdBridge2.relayerConsensusThreshold()).eq(
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      )

      const bridgeByToken = await bridgeFactory.getBridgeByToken(NATIVE_TOKEN, 0)
      expect(bridgeByToken).eq(bridgeAddrNative)
    })
    it('Creating bridges should revert due to not mulsigwallet', async () => {
      const { bridgeFactory, assetToken } = await useContracts()
      const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

      // const creatorRole = await bridgeFactory.CREATOR_ROLE()
      await expect(
        bridgeFactory
          .connect(deployer)
          .createBridgeAssist(
            BridgeType.MINT,
            assetToken.address,
            DEFAULT_LIMIT_PER_SEND,
            feeWallet.address,
            DEFAULT_FEE_SEND,
            DEFAULT_FEE_FULFILL,
            bridgeCreator.address,
            [relayer.address],
            DEFAULT_RELAYER_CONSENSUS_THRESHOLD
          )
      ).revertedWith(BridgeFactoryErrors.NotMultiSigWallet)
    })
  })
  describe('Adding/removing bridges', () => {
    it('Should successfully add new bridges', async () => {
      const { bridgeFactory, assetToken, multiSigWallet } = await useContracts()
      const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

      const oldBridgeFactory: OldBridgeAssist__factory = await ethers.getContractFactory(
        'OldBridgeAssist',
        deployer
      )
      let bridgesAddresses: string[] = []

      const bridgesNum = (await bridgeFactory.ADD_REMOVE_LIMIT_PER_TIME()).toNumber()
      for (let index = 0; index < bridgesNum; index++) {
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
        bridgesAddresses.push(bridgeDeployed.address)
      }
      const addBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'addBridgeAssists',
        [bridgesAddresses]
      )
      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, addBridgeAssistsData)
      await multiSigWallet.connect(relayer).approveTransaction(1)
      // await bridgeFactory.connect(deployer).addBridgeAssists(bridgesAddresses)

      await expect(bridgeFactory.getCreatedBridgesInfo(0, 0)).revertedWith(
        BridgeFactoryErrors.ZeroLengthArray
      )

      expect(await bridgeFactory.getCreatedBridgesLength()).eq(bridgesNum)
      const bridgesInfo = await bridgeFactory.getCreatedBridgesInfo(0, 2)

      expect(bridgesInfo[0].bridgeAssist).eq(bridgesAddresses[0])
      expect(bridgesInfo[0].token).eq(assetToken.address)
      expect(bridgesInfo[1].bridgeAssist).eq(bridgesAddresses[1])
      expect(bridgesInfo[1].token).eq(assetToken.address)

      expect(await bridgeFactory.getBridgesByTokenLength(assetToken.address)).eq(
        bridgesNum
      )
      const bridgesByToken = await bridgeFactory.getBridgesByToken(
        assetToken.address,
        0,
        bridgesNum
      )
      expect(bridgesByToken[0]).eq(bridgesInfo[0].bridgeAssist)
      expect(bridgesByToken[1]).eq(bridgesInfo[1].bridgeAssist)

      const bridgeByToken = await bridgeFactory.getBridgeByToken(assetToken.address, 0)
      expect(bridgeByToken).eq(bridgesByToken[0])

      await expect(
        bridgeFactory.getBridgeByToken(ethers.constants.AddressZero, 0)
      ).revertedWith(BridgeFactoryErrors.NoBridgesByToken)
      await expect(bridgeFactory.getBridgeByToken(assetToken.address, 100)).revertedWith(
        BridgeFactoryErrors.InvalidIndex
      )

      await expect(
        bridgeFactory.getBridgesByToken(ethers.constants.AddressZero, 0, 1)
      ).revertedWith(BridgeFactoryErrors.NoBridgesByToken)
      await expect(
        bridgeFactory.getBridgesByToken(assetToken.address, 0, 1000)
      ).revertedWith(BridgeFactoryErrors.InvalidOffsetLimit)
      await expect(
        bridgeFactory.getBridgesByToken(assetToken.address, 0, 0)
      ).revertedWith(BridgeFactoryErrors.ZeroLengthArray)

      await expect(bridgeFactory.getBridgesByToken(deployer.address, 0, 10)).revertedWith(
        BridgeFactoryErrors.NoBridgesByToken
      )
      await expect(bridgeFactory.getCreatedBridgesInfo(0, 101)).revertedWith(
        BridgeFactoryErrors.InvalidOffsetLimit
      )
      await expect(bridgeFactory.getCreatedBridgeInfo(100)).revertedWith(
        BridgeFactoryErrors.InvalidIndex
      )
      await expect(bridgeFactory.getBridgeByToken(assetToken.address, 100)).revertedWith(
        BridgeFactoryErrors.InvalidIndex
      )
    })
    it('Should successfully add bridges in 1 tx up to limit', async () => {
      const { bridgeFactory, assetToken, multiSigWallet } = await useContracts()
      const [deployer, relayer, , feeWallet] = await ethers.getSigners()

      const oldBridgeFactory: OldBridgeAssist__factory = await ethers.getContractFactory(
        'OldBridgeAssist',
        deployer
      )
      let bridgesAddresses: string[] = []

      const bridgesNum = await (
        await bridgeFactory.ADD_REMOVE_LIMIT_PER_TIME()
      ).toNumber()
      for (let index = 0; index < bridgesNum; index++) {
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
        bridgesAddresses.push(bridgeDeployed.address)
      }
      const addBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'addBridgeAssists',
        [bridgesAddresses]
      )
      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, addBridgeAssistsData)

      // const tx = bridgeFactory.connect(deployer).addBridgeAssists(bridgesAddresses)
      await expect(multiSigWallet.connect(relayer).approveTransaction(1)).not.reverted
      // expect((await (await tx).wait()).gasUsed).lt(GAS_LIMIT_PER_BLOCK)
    })
    it('Adding new bridges should revert', async () => {
      const { bridgeFactory, assetToken, bridgeMint, multiSigWallet } =
        await useContracts()
      const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

      const oldBridgeFactory: OldBridgeAssist__factory = await ethers.getContractFactory(
        'OldBridgeAssist',
        deployer
      )
      let bridgesAddresses: string[] = []

      const bridgesNum =
        (await (await bridgeFactory.ADD_REMOVE_LIMIT_PER_TIME()).toNumber()) + 1
      for (let index = 0; index < bridgesNum; index++) {
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
        bridgesAddresses.push(bridgeDeployed.address)
      }

      const addBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'addBridgeAssists',
        [bridgesAddresses]
      )
      const zeroaddBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'addBridgeAssists',
        [[ethers.constants.AddressZero]]
      )
      const zeroLengthaddBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'addBridgeAssists',
        [[]]
      )
      const duplicateaddBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'addBridgeAssists',
        [[bridgesAddresses[0], bridgesAddresses[0]]]
      )
      const tokenZeroaddBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'addBridgeAssists',
        [[bridgeMint.address]]
      )
      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, addBridgeAssistsData)

      await expect(multiSigWallet.connect(relayer).approveTransaction(1)).reverted

      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, zeroLengthaddBridgeAssistsData)

      await expect(multiSigWallet.connect(relayer).approveTransaction(2)).reverted

      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, zeroaddBridgeAssistsData)

      await expect(multiSigWallet.connect(relayer).approveTransaction(3)).reverted
      // await expect(
      //   bridgeFactory
      //     .connect(deployer)
      //     .addBridgeAssists([bridgesAddresses[0], ethers.constants.AddressZero])
      // ).revertedWith(ERRORS.bridgeZeroAddressAtIndex(1))
      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, duplicateaddBridgeAssistsData)
      await expect(multiSigWallet.connect(relayer).approveTransaction(4)).reverted
      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, tokenZeroaddBridgeAssistsData)
      await expect(multiSigWallet.connect(relayer).approveTransaction(5)).reverted
    })
    it('Should successfully remove bridges', async () => {
      const { bridgeFactory, assetToken, multiSigWallet } = await useContracts()
      const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

      const oldBridgeFactory: OldBridgeAssist__factory = await ethers.getContractFactory(
        'OldBridgeAssist',
        deployer
      )
      let bridgesAddresses: string[] = []

      const bridgesNum = await (
        await bridgeFactory.ADD_REMOVE_LIMIT_PER_TIME()
      ).toNumber()
      for (let index = 0; index < bridgesNum; index++) {
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
        bridgesAddresses.push(bridgeDeployed.address)
      }

      const addBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'addBridgeAssists',
        [bridgesAddresses]
      )
      const removeBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'removeBridgeAssists',
        [[bridgesAddresses[0]]]
      )

      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, addBridgeAssistsData)

      // const defaultAdminRole = await bridgeFactory.DEFAULT_ADMIN_ROLE()

      // await expect(
      //   bridgeFactory.connect(relayer).addBridgeAssists(bridgesAddresses)
      // ).revertedWith(ERRORS.accessControl(relayer.address, defaultAdminRole))
      await multiSigWallet.connect(relayer).approveTransaction(1)

      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, removeBridgeAssistsData)
      await multiSigWallet.connect(relayer).approveTransaction(2)

      // await bridgeFactory.connect(deployer).removeBridgeAssists([bridgesAddresses[0]])
      expect(await bridgeFactory.getCreatedBridgesLength()).eq(bridgesNum - 1)

      const createdBridges = await bridgeFactory.getCreatedBridgesInfo(0, bridgesNum - 1)
      for (let index = 0; index < createdBridges.length; index++) {
        expect(createdBridges[index].bridgeAssist).not.eq(bridgesAddresses[0])
      }
    })
    it('Should successfully remove bridges in 1 tx up to limit', async () => {
      const { bridgeFactory, assetToken, multiSigWallet } = await useContracts()
      const [deployer, relayer, , feeWallet] = await ethers.getSigners()

      const oldBridgeFactory: OldBridgeAssist__factory = await ethers.getContractFactory(
        'OldBridgeAssist',
        deployer
      )
      let bridgesAddresses: string[] = []

      const bridgesNum = await (
        await bridgeFactory.ADD_REMOVE_LIMIT_PER_TIME()
      ).toNumber()
      for (let index = 0; index < bridgesNum; index++) {
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
        bridgesAddresses.push(bridgeDeployed.address)
      }

      const addBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'addBridgeAssists',
        [bridgesAddresses]
      )
      const removeBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'removeBridgeAssists',
        [bridgesAddresses]
      )
      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, addBridgeAssistsData)

      await multiSigWallet.connect(relayer).approveTransaction(1)

      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, removeBridgeAssistsData)

      // const tx = bridgeFactory.connect(deployer).removeBridgeAssists(bridgesAddresses)
      await expect(multiSigWallet.connect(relayer).approveTransaction(2)).not.reverted
      // expect((await (await tx).wait()).gasUsed).lt(GAS_LIMIT_PER_BLOCK)
    })
    it('Removing bridges should revert', async () => {
      const { bridgeFactory, assetToken, multiSigWallet } = await useContracts()
      const [deployer, relayer, , feeWallet] = await ethers.getSigners()

      const oldBridgeFactory: OldBridgeAssist__factory = await ethers.getContractFactory(
        'OldBridgeAssist',
        deployer
      )
      let bridgesAddresses: string[] = []

      const bridgesNum =
        (await (await bridgeFactory.ADD_REMOVE_LIMIT_PER_TIME()).toNumber()) + 1
      for (let index = 0; index < bridgesNum; index++) {
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
        bridgesAddresses.push(bridgeDeployed.address)
      }
      const removeBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'removeBridgeAssists',
        [bridgesAddresses]
      )
      const zeroBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'removeBridgeAssists',
        [[]]
      )
      const zeroAddrBridgeAssistsData = bridgeFactory.interface.encodeFunctionData(
        'removeBridgeAssists',
        [[ethers.constants.AddressZero]]
      )
      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, removeBridgeAssistsData)
      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, zeroBridgeAssistsData)
      await multiSigWallet
        .connect(deployer)
        .createTransaction(bridgeFactory.address, zeroAddrBridgeAssistsData)

      // const defaultAdminRole = await bridgeFactory.DEFAULT_ADMIN_ROLE()

      await expect(multiSigWallet.connect(relayer).approveTransaction(1)).reverted
      await expect(multiSigWallet.connect(relayer).approveTransaction(2)).reverted
      await expect(multiSigWallet.connect(relayer).approveTransaction(3)).reverted

      await expect(
        bridgeFactory.connect(deployer).removeBridgeAssists([ethers.constants.AddressZero])
      ).reverted
    })
  })
  it('Should successfully change bridge implementation', async () => {
    const { bridgeFactory, assetToken, bridgeMint, multiSigWallet } = await useContracts()
    const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

    const defaultAdminRole = await bridgeFactory.DEFAULT_ADMIN_ROLE()
    await expect(
      bridgeFactory
        .connect(relayer)
        .changeBridgeAssistImplementation(
          assetToken.address,
          assetToken.address,
          assetToken.address,
          assetToken.address
        )
    ).revertedWith(BridgeFactoryErrors.NotMultiSigWallet)

    const implementations_1 = bridgeFactory.interface.encodeFunctionData(
      'changeBridgeAssistImplementation',
      [
        ethers.constants.AddressZero,
        assetToken.address,
        assetToken.address,
        assetToken.address,
      ]
    )
    const implementations_2 = bridgeFactory.interface.encodeFunctionData(
      'changeBridgeAssistImplementation',
      [assetToken.address, assetToken.address, assetToken.address, assetToken.address]
    )
    const implementations_3 = bridgeFactory.interface.encodeFunctionData(
      'changeBridgeAssistImplementation',
      [
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        assetToken.address,
        assetToken.address,
      ]
    )
    const implementations_4 = bridgeFactory.interface.encodeFunctionData(
      'changeBridgeAssistImplementation',
      [
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
      ]
    )

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, implementations_1)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, implementations_1)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, implementations_2)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, implementations_1)

    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, implementations_3)
    await multiSigWallet
      .connect(deployer)
      .createTransaction(bridgeFactory.address, implementations_4)

    multiSigWallet.connect(relayer).approveTransaction(1)

    // await bridgeFactory
    //   .connect(deployer)
    //   .changeBridgeAssistImplementation(
    //     ethers.constants.AddressZero,
    //     assetToken.address,
    //     assetToken.address,
    //     assetToken.address
    //   ) // token is invalid implementation (only for tests)
    expect(await bridgeFactory.bridgeAssistImplementation(BridgeType.MINT)).eq(
      assetToken.address
    )
    expect(await bridgeFactory.bridgeAssistImplementation(BridgeType.NATIVE)).eq(
      assetToken.address
    )
    expect(await bridgeFactory.bridgeAssistImplementation(BridgeType.CIRCLEMINTBURN)).eq(
      assetToken.address
    )

    await expect(multiSigWallet.connect(relayer).approveTransaction(2)).reverted

    await expect(multiSigWallet.connect(relayer).approveTransaction(3)).not.reverted

    await expect(multiSigWallet.connect(relayer).approveTransaction(4)).not.reverted

    await expect(
      multiSigWallet.connect(relayer).approveTransaction(5)
    ).not.reverted

    await expect(
      multiSigWallet.connect(relayer).approveTransaction(6)
    ).not.reverted
  })
})
