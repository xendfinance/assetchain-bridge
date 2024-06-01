import { ethers } from 'hardhat'
import { expect } from 'chai'

import { useContracts, deploy } from '@/test'
import {
  BridgeAssistTransferUpgradeable__factory,
  BridgeFactoryUpgradeable__factory,
  OldBridgeAssist__factory,
} from '@/typechain'
import { accessControlError, disableInitializer } from '../utils/utils'
import {
  DEFAULT_FEE_FULFILL,
  DEFAULT_FEE_SEND,
  DEFAULT_LIMIT_PER_SEND,
  DEFAULT_RELAYER_CONSENSUS_THRESHOLD,
} from '../utils/constants'
import { ERRORS } from '../utils/errors'
import { BigNumber } from 'ethers'
import { BridgeType } from '../asset/BridgeFactoryAsset.test'

const GAS_LIMIT_PER_BLOCK = BigNumber.from(20_000_000)

describe('BridgeFactory contract (non asset chain)', () => {
  beforeEach(async () => {
    await deploy()
  })
  describe('Initializing', () => {
    it('Should execute initializer correctly', async () => {
      const { bridgeFactory, bridgeDefault } = await useContracts()
      const [deployer] = await ethers.getSigners()

      expect(await bridgeFactory.bridgeAssistImplementation(BridgeType.DEFAULT)).eq(
        bridgeDefault.address
      )

      const defaultAdminRole = await bridgeFactory.DEFAULT_ADMIN_ROLE()
      expect(await bridgeFactory.hasRole(defaultAdminRole, deployer.address)).true
    })
    it('Initializer should revert', async () => {
      const { bridgeDefault } = await useContracts()
      const [deployer] = await ethers.getSigners()

      const bridgeFactoryFactory: BridgeFactoryUpgradeable__factory =
        await ethers.getContractFactory('BridgeFactoryUpgradeable', deployer)

      const bridgeFactory = await bridgeFactoryFactory.connect(deployer).deploy()
      await disableInitializer(bridgeFactory.address)

      await expect(
        bridgeFactory
          .connect(deployer)
          .initialize(
            bridgeDefault.address,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero
          )
      ).revertedWith(ERRORS.ownerZeroAddress)
    })
    it('Re-initialize should revert', async () => {
      const { bridgeDefault, bridgeFactory } = await useContracts()
      const [deployer, user] = await ethers.getSigners()

      await expect(
        bridgeFactory
          .connect(deployer)
          .initialize(
            bridgeDefault.address,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            user.address
          )
      ).revertedWith(ERRORS.initialized)
    })
  })
  describe('Creating bridgeDefault', () => {
    it('Should successfully create bridgeDefault', async () => {
      const { bridgeFactory, token } = await useContracts()
      const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

      const defaultAdminRole = await bridgeFactory.DEFAULT_ADMIN_ROLE()

      const bridgeAddr = await bridgeFactory
        .connect(bridgeCreator)
        .callStatic.createBridgeAssist(
          BridgeType.DEFAULT,
          token.address,
          DEFAULT_LIMIT_PER_SEND,
          feeWallet.address,
          DEFAULT_FEE_SEND,
          DEFAULT_FEE_FULFILL,
          bridgeCreator.address,
          [relayer.address],
          DEFAULT_RELAYER_CONSENSUS_THRESHOLD
        )
      await bridgeFactory
        .connect(bridgeCreator)
        .createBridgeAssist(
          BridgeType.DEFAULT,
          token.address,
          DEFAULT_LIMIT_PER_SEND,
          feeWallet.address,
          DEFAULT_FEE_SEND,
          DEFAULT_FEE_FULFILL,
          bridgeCreator.address,
          [relayer.address],
          DEFAULT_RELAYER_CONSENSUS_THRESHOLD
        )

      expect(await bridgeFactory.getCreatedBridgesLength()).eq(1)
      const createdBridgeInfo = (await bridgeFactory.getCreatedBridgesInfo(0, 1))[0]
      expect(createdBridgeInfo.bridgeAssist).eq(bridgeAddr)
      expect(createdBridgeInfo.token).eq(token.address)

      const createdBridgeInfoByIndex = await bridgeFactory.getCreatedBridgeInfo(0)
      expect(createdBridgeInfoByIndex.bridgeAssist).eq(bridgeAddr)
      expect(createdBridgeInfoByIndex.token).eq(token.address)

      const createdBridge = BridgeAssistTransferUpgradeable__factory.connect(
        bridgeAddr,
        ethers.provider
      )
      expect(await createdBridge.TOKEN()).eq(token.address)
      expect(await createdBridge.limitPerSend()).eq(DEFAULT_LIMIT_PER_SEND)
      expect(await createdBridge.feeWallet()).eq(feeWallet.address)
      expect(await createdBridge.feeSend()).eq(DEFAULT_FEE_SEND)
      expect(await createdBridge.feeFulfill()).eq(DEFAULT_FEE_FULFILL)
      expect(await createdBridge.hasRole(defaultAdminRole, bridgeCreator.address)).true
      expect(await createdBridge.getRelayers()).deep.eq([relayer.address])
      expect(await createdBridge.relayerConsensusThreshold()).eq(
        DEFAULT_RELAYER_CONSENSUS_THRESHOLD
      )
    })
    it('Creating bridgeDefault should revert due to the wrong creator', async () => {
      const { bridgeFactory, token } = await useContracts()
      const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

      const creatorRole = await bridgeFactory.CREATOR_ROLE()
      await expect(
        bridgeFactory
          .connect(deployer)
          .createBridgeAssist(
            BridgeType.DEFAULT,
            token.address,
            DEFAULT_LIMIT_PER_SEND,
            feeWallet.address,
            DEFAULT_FEE_SEND,
            DEFAULT_FEE_FULFILL,
            bridgeCreator.address,
            [relayer.address],
            DEFAULT_RELAYER_CONSENSUS_THRESHOLD
          )
      ).revertedWith(ERRORS.accessControl(deployer.address, creatorRole))
    })
  })
  describe('Adding/removing bridges', () => {
    it('Should successfully add new bridges', async () => {
      const { bridgeFactory, token } = await useContracts()
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
            token.address,
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
      await bridgeFactory.connect(deployer).addBridgeAssists(bridgesAddresses)

      await expect(bridgeFactory.getCreatedBridgesInfo(0, 0)).revertedWith(
        ERRORS.zeroLimit
      )

      expect(await bridgeFactory.getCreatedBridgesLength()).eq(bridgesNum)
      const bridgesInfo = await bridgeFactory.getCreatedBridgesInfo(0, 2)

      expect(bridgesInfo[0].bridgeAssist).eq(bridgesAddresses[0])
      expect(bridgesInfo[0].token).eq(token.address)
      expect(bridgesInfo[1].bridgeAssist).eq(bridgesAddresses[1])
      expect(bridgesInfo[1].token).eq(token.address)

      expect(await bridgeFactory.getBridgesByTokenLength(token.address)).eq(bridgesNum)
      const bridgesByToken = await bridgeFactory.getBridgesByToken(
        token.address,
        0,
        bridgesNum
      )
      expect(bridgesByToken[0]).eq(bridgesInfo[0].bridgeAssist)
      expect(bridgesByToken[1]).eq(bridgesInfo[1].bridgeAssist)

      const bridgeByToken = await bridgeFactory.getBridgeByToken(token.address, 0)
      expect(bridgeByToken).eq(bridgesByToken[0])

      await expect(
        bridgeFactory.getBridgeByToken(ethers.constants.AddressZero, 0)
      ).revertedWith(ERRORS.noBridgesByToken)
      await expect(bridgeFactory.getBridgeByToken(token.address, 100)).revertedWith(
        ERRORS.invalidIndex
      )

      await expect(
        bridgeFactory.getBridgesByToken(ethers.constants.AddressZero, 0, 1)
      ).revertedWith(ERRORS.noBridgesByToken)
      await expect(bridgeFactory.getBridgesByToken(token.address, 0, 1000)).revertedWith(
        ERRORS.invalidOffsetLimit
      )
      await expect(bridgeFactory.getBridgesByToken(token.address, 0, 0)).revertedWith(
        ERRORS.zeroLimit
      )

      await expect(bridgeFactory.getBridgesByToken(deployer.address, 0, 10)).revertedWith(
        ERRORS.noBridgesByToken
      )
      await expect(bridgeFactory.getCreatedBridgesInfo(0, 101)).revertedWith(
        ERRORS.invalidOffsetLimit
      )
      await expect(bridgeFactory.getCreatedBridgeInfo(100)).revertedWith(
        ERRORS.invalidIndex
      )
      await expect(bridgeFactory.getBridgeByToken(token.address, 100)).revertedWith(
        ERRORS.invalidIndex
      )
    })
    it('Should successfully add bridges in 1 tx up to limit', async () => {
      const { bridgeFactory, token, bridgeDefault } = await useContracts()
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
            token.address,
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

      const tx = bridgeFactory.connect(deployer).addBridgeAssists(bridgesAddresses)
      await expect(tx).not.reverted
      expect((await (await tx).wait()).gasUsed).lt(GAS_LIMIT_PER_BLOCK)
    })
    it('Adding new bridges should revert', async () => {
      const { bridgeFactory, token, bridgeDefault } = await useContracts()
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
            token.address,
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

      await expect(
        bridgeFactory.connect(deployer).addBridgeAssists(bridgesAddresses)
      ).revertedWith(ERRORS.arrayLengthExceedsLimit)
      await expect(bridgeFactory.connect(deployer).addBridgeAssists([])).revertedWith(
        ERRORS.zeroLengthArray
      )

      await expect(
        bridgeFactory.connect(deployer).addBridgeAssists([ethers.constants.AddressZero])
      ).revertedWith(ERRORS.bridgeZeroAddressAtIndex(0))
      await expect(
        bridgeFactory
          .connect(deployer)
          .addBridgeAssists([bridgesAddresses[0], ethers.constants.AddressZero])
      ).revertedWith(ERRORS.bridgeZeroAddressAtIndex(1))
      await expect(
        bridgeFactory
          .connect(deployer)
          .addBridgeAssists([bridgesAddresses[0], bridgesAddresses[0]])
      ).revertedWith(ERRORS.bridgeDuplicateAtIndex(1))
      await expect(
        bridgeFactory.connect(deployer).addBridgeAssists([bridgeDefault.address])
      ).revertedWith(ERRORS.tokenZeroAddressAtIndex(0))
    })
    it('Should successfully remove bridges', async () => {
      const { bridgeFactory, token } = await useContracts()
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
            token.address,
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

      const defaultAdminRole = await bridgeFactory.DEFAULT_ADMIN_ROLE()

      await expect(
        bridgeFactory.connect(relayer).addBridgeAssists(bridgesAddresses)
      ).revertedWith(ERRORS.accessControl(relayer.address, defaultAdminRole))
      await bridgeFactory.connect(deployer).addBridgeAssists(bridgesAddresses)

      await bridgeFactory.connect(deployer).removeBridgeAssists([bridgesAddresses[0]])
      expect(await bridgeFactory.getCreatedBridgesLength()).eq(bridgesNum - 1)

      const createdBridges = await bridgeFactory.getCreatedBridgesInfo(0, bridgesNum - 1)
      for (let index = 0; index < createdBridges.length; index++) {
        expect(createdBridges[index].bridgeAssist).not.eq(bridgesAddresses[0])
      }
    })
    it('Should successfully remove bridges in 1 tx up to limit', async () => {
      const { bridgeFactory, token, bridgeDefault } = await useContracts()
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
            token.address,
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

      await bridgeFactory.connect(deployer).addBridgeAssists(bridgesAddresses)
      const tx = bridgeFactory.connect(deployer).removeBridgeAssists(bridgesAddresses)
      await expect(tx).not.reverted
      expect((await (await tx).wait()).gasUsed).lt(GAS_LIMIT_PER_BLOCK)
    })
    it('Removing bridges should revert', async () => {
      const { bridgeFactory, token, bridgeDefault } = await useContracts()
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
            token.address,
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

      const defaultAdminRole = await bridgeFactory.DEFAULT_ADMIN_ROLE()

      await expect(
        bridgeFactory.connect(deployer).removeBridgeAssists(bridgesAddresses)
      ).revertedWith(ERRORS.arrayLengthExceedsLimit)
      await expect(bridgeFactory.connect(deployer).removeBridgeAssists([])).revertedWith(
        ERRORS.zeroLengthArray
      )
      await expect(
        bridgeFactory
          .connect(deployer)
          .removeBridgeAssists([ethers.constants.AddressZero])
      ).revertedWith(ERRORS.bridgeNotFoundAtIndex(0))

      await expect(
        bridgeFactory.connect(relayer).removeBridgeAssists([ethers.constants.AddressZero])
      ).revertedWith(ERRORS.accessControl(relayer.address, defaultAdminRole))
    })
  })
  it('Should successfully change bridgeDefault implementation', async () => {
    const { bridgeFactory, token, bridgeDefault } = await useContracts()
    const [deployer, relayer, , feeWallet, bridgeCreator] = await ethers.getSigners()

    const defaultAdminRole = await bridgeFactory.DEFAULT_ADMIN_ROLE()
    await expect(
      bridgeFactory
        .connect(relayer)
        .changeBridgeAssistImplementation(
          token.address,
          ethers.constants.AddressZero,
          ethers.constants.AddressZero
        )
    ).revertedWith(ERRORS.accessControl(relayer.address, defaultAdminRole))

    await bridgeFactory
      .connect(deployer)
      .changeBridgeAssistImplementation(
        token.address,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero
      ) // token is invalid implementation (only for tests)
    expect(await bridgeFactory.bridgeAssistImplementation(BridgeType.DEFAULT)).eq(
      token.address
    )
  })
})
