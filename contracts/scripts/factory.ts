// const readlineSync =  require('readline-sync');
import readlineSync from 'readline-sync'
import colors from 'colors'
import { ethers } from 'hardhat'
import * as CONTRACTS from '../dev/contracts.json'
import { BigNumber, ContractTransaction } from 'ethers'

enum BRIDGETYPE {
  TRANSFER,
  MINT,
  NATIVE,
}

const DEFAULT_LIMIT_PER_SEND = ethers.utils.parseEther('100')
const DEFAULT_FEE_SEND = 0
const DEFAULT_FEE_FULFILL = 0
const DEFAULT_RELAYER_CONSENSUS_THRESHOLD = 1
const NATIVE_TOKEN = `0x0000000000000000000000000000000000000001`

async function init() {
  const { chainId, name } = await ethers.provider.getNetwork()
  console.log(colors.bold.yellow(`ChainId ${chainId} network ${name}`))
  const signers = await ethers.getSigners()
  if (signers.length > 1) throw new Error(`Signers must be at least 2`)
  const contract = CONTRACTS[getIndex(chainId)]
  if (!contract) throw new Error(`Contract not deployed on network ${name} ${chainId}`)
  const factoryAddress = contract[0].contracts.BridgeFactoryUpgradeable.address
  const factoryAbi = contract[0].contracts.BridgeFactoryUpgradeable.abi
  const factoryContract = await ethers.getContractAt(factoryAbi, factoryAddress)
  const tokenAddress = contract[0].contracts.USDC.address // you can choose any token of your choose, USDC,USDT,DAI
  const tokenAbi = contract[0].contracts.USDC.abi
  const tokenContract = await ethers.getContractAt(tokenAbi, tokenAddress)
  const bridgetokenAddress = CONTRACTS[42421][0].contracts.USDC.address // you can choose any token of your choose, USDC,USDT,DAI
  const bridgetokenAbi = CONTRACTS[42421][0].contracts.USDC.abi
  const owner = signers[0]
  const user = signers[1]

  console.log(`getting creator role...`)
  const creatorRole: string = await factoryContract.CREATOR_ROLE()
  console.log(`Creator role ${creatorRole}`)
  const hasRole: boolean = await factoryContract.hasRole(creatorRole, owner.address)
  if (!hasRole) {
    console.warn(`${owner.address} doesn't have creator role. Granting role...`)
    const tx: ContractTransaction = await factoryContract
      .connect(owner)
      .grantRole(creatorRole, owner.address)
    await tx.wait(1)
    console.log(`Granted ${owner.address} creator role`, `hash ${tx.hash}`)
  }

  return {
    factoryContract,
    tokenContract,
    owner,
    user,
    bridgetokenAbi,
    bridgetokenAddress,
    chainId,
  }
}

async function createBridge(configs: any, type: BRIDGETYPE) {
  const {
    factoryContract,
    tokenContract,
    owner,
    user,
    bridgetokenAddress,
    bridgetokenAbi,
    chainId,
  } = configs
  console.log(`Creating bridge of type ${type}`)
  if (type === BRIDGETYPE.MINT && chainId !== 42421)
    throw new Error(
      `You can only create mint type bridge on assetchain with this script...`
    )
  if (type === BRIDGETYPE.NATIVE && chainId !== 42421)
    throw new Error(
      `You can only create Native type bridge on assetchain with this script...`
    )
  const createBridgetx: ContractTransaction = await factoryContract
    .connect(owner)
    .createBridgeAssist(
      type,
      type === BRIDGETYPE.MINT
        ? bridgetokenAddress
        : type === BRIDGETYPE.NATIVE
        ? NATIVE_TOKEN
        : tokenContract.address,
      DEFAULT_LIMIT_PER_SEND,
      owner.address,
      DEFAULT_FEE_SEND,
      DEFAULT_FEE_FULFILL,
      owner.address,
      [owner.address],
      DEFAULT_RELAYER_CONSENSUS_THRESHOLD
    )
  await createBridgetx.wait(1)
  console.log(`created bridge type of ${type} ${createBridgetx.hash}`)
  if (type === BRIDGETYPE.MINT) {
    console.log(`Trying to grant createdbrigde role for token...`)
    console.log(`getting bridgeAssist address`)
    const bridgeLength: BigNumber = await factoryContract.getBridgesByTokenLength(
      bridgetokenAddress
    )
    console.log(`Bridge length ${bridgeLength.toNumber()}`)
    const bridgeAssistAddress: string = await factoryContract.getBridgeByToken(
      bridgetokenAddress,
      bridgeLength.toNumber() - 1
    )
    const bridgeTokenContract = await ethers.getContractAt(
      bridgetokenAbi,
      bridgetokenAddress
    )
    const MINTERROLE: string = await bridgeTokenContract.MINTER_ROLE()
    const BURNERROLE: string = await bridgeTokenContract.BURNER_ROLE()
    console.log(colors.green(`minter role ${MINTERROLE}`))
    console.log(colors.green(`burner role ${BURNERROLE}`))
    const tx: ContractTransaction = await bridgeTokenContract
      .connect(owner)
      .grantRole(MINTERROLE, bridgeAssistAddress)
    await tx.wait(1)
    console.log(`minter role granted`, `hash ${tx.hash}`)
    const tx2: ContractTransaction = await bridgeTokenContract
      .connect(owner)
      .grantRole(BURNERROLE, bridgeAssistAddress)
    await tx2.wait(1)
    console.log(`burner role granted`, `hash ${tx2.hash}`)
  }
}
// use this to add bridge assist contract already deployed....
async function addBridge(config: any, bridgeAddress: string) {
  const { factoryContract, owner } = config
  const tx: ContractTransaction = await factoryContract
    .connect(owner)
    .addBridgeAssists([bridgeAddress])
  await tx.wait(1)
  console.log(`add bridge assist successful`, `hash ${tx.hash}`)
}
// use this to remove bridge assist from the factory
async function removeBridgeAssists(config: any, bridgeAddress: string) {
  const { factoryContract, owner } = config
  const tx: ContractTransaction = await factoryContract
    .connect(owner)
    .removeBridgeAssists([bridgeAddress])
  await tx.wait(1)
  console.log(`add bridge assist successful`, `hash ${tx.hash}`)
}

// getBridgeAssist
async function getFactoryBridgeAssists(config: any) {
  const { factoryContract, owner } = config
  const bridges: { bridgeAssist: string; token: string }[] =
    await factoryContract.getCreatedBridgesInfo(0, 2)

  for (let b of bridges) {
    console.log(colors.green(`Bridge Assist Address: ${b.bridgeAssist}`))
    console.log(colors.green(`Token Address: ${b.token}`))
  }
}

function getIndex(chainId: number) {
  switch (chainId) {
    case 97:
      return '97'
    case 42421:
      return '42421'
    case 11155111:
      return '11155111'
    case 421614:
      return '421614'
    case 80002:
      return '80002'
    case 84532:
      return '84532'
    default:
      return '42421'
  }
}

async function main() {
  console.log(`initializing contract....`)
  const config = await init()
  console.log(`done....`)

  let running = true

  while (running) {
    initMessage()
    const ip = readlineSync.question(colors.bold.yellow('Your choice: '))
    if (!isNumeric(ip)) {
      console.log(colors.green('System: ') + `Invalid choice ${ip}`)
      continue
    }
    const choice = +ip
    switch (choice) {
      case 1:
        bridgeTypeMessage()
        const bridgeTypeChoice = readlineSync.question(
          colors.bold.yellow('Your choice: ')
        )
        const type = bridgeType(bridgeTypeChoice)
        if (!type) continue
        if (type > 3) return running = false
        try {
          await createBridge(config, type - 1)
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 2:
        bridgeAddMessage()
        const choiceAdd = readlineSync.question(colors.bold.yellow('Your choice: '))
        // const isAddress = ethers.utils.isAddress(choiceAdd)
        // if (!isAddress) {
        //   console.log(colors.red(`Invalid address ${choiceAdd}`))
        //   continue
        // }
        try {
          await addBridge(config, choiceAdd)
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 3:
        bridgeAddMessage()
        const choiceremove = readlineSync.question(colors.bold.yellow('Input address: '))
        // const isAddressRemove = ethers.utils.isAddress(choiceremove)
        // if (!isAddressRemove) {
        //   console.log(colors.red(`Invalid address ${choiceremove}`))
        //   continue
        // }
        try {
          await removeBridgeAssists(config, choiceremove)
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 4:
        try {
          await getFactoryBridgeAssists(config)
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 5:
        running = false
        console.log(colors.yellow('Exiting...'))
        break
      default:
        console.log(colors.yellow('Invalid Choice'))
        break
    }
  }
}

function initMessage() {
  console.log(colors.blue('system: ') + `Select your action`)
  console.log(colors.blue('1: ') + `create a bridge`)
  console.log(colors.blue('2: ') + `add a deployed bridge to factory`)
  console.log(colors.blue('3: ') + `remove a bridge from factory`)
  console.log(colors.blue('4: ') + `get bridges in factory`)
  console.log(colors.blue('5: ') + `quit process`)
}

function bridgeTypeMessage() {
  console.log(colors.blue('system: ') + `Select bridge type`)
  console.log(colors.blue('1:  ') + `transfer type`)
  console.log(colors.blue('2:  ') + `mint type`)
  console.log(colors.blue('3:  ') + `native type`)
  console.log(colors.blue('4:  ') + `quit process`)
}

function bridgeType(answer: string) {
  if (!isNumeric(answer)) {
    console.log(colors.green('system: ') + `Invalid choice ${answer}`)
    return 
  }
  return +answer
}

function bridgeAddMessage() {
  console.log(colors.blue('system: ') + `Input bridge address`)
}

function isNumeric(str: string) {
  return /^[0-9]+$/.test(str)
}

main().catch(console.error)
