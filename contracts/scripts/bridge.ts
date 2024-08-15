import readlineSync from 'readline-sync'
import colors from 'colors'
import { ethers } from 'hardhat'
import * as CONTRACTS from '../contracts.json'
import * as _CONTRACTS from '../dev/contracts.json'
import * as ABI from './abi.json'
import { BigNumber, Contract, ContractTransaction } from 'ethers'

enum BRIDGETYPE {
  TRANSFER,
  MINT,
  NATIVE,
}
interface Transaction {
  amount: BigNumber
  timestamp: string
  fromUser: string
  toUser: string // can be a solana address
  fromChain: string
  toChain: string
  nonce: number
  block: string
}

interface FulfillTx {
  amount: string
  fromUser: string // can be a solana address
  toUser: string
  fromChain: string
  nonce: string
}

async function init() {
  const { chainId, name } = await ethers.provider.getNetwork()
  console.log(colors.bold.yellow(`ChainId ${chainId} network ${name}`))
  const signers = await ethers.getSigners()
  if (signers.length <= 0) throw new Error(`Signers must be at least 2`)
  const contract = CONTRACTS[getIndex(chainId)]
  if (!contract) throw new Error(`Contract not deployed on network ${name} ${chainId}`)
  const bridgetransferAbi =
    CONTRACTS['421614'][0].contracts.BridgeAssistTransferUpgradeable.abi
  const bridgeMintAbi = CONTRACTS['42421'][0].contracts.BridgeAssistMintUpgradeable.abi
  const bridgeNativeAbi =
    _CONTRACTS['200810'][0].contracts.BridgeAssistNativeUpgradeable.abi
  const tokenAddress = contract[0].contracts.USDC.address // you can choose any token of your choose, USDC,USDT,DAI
  const tokenAbi = contract[0].contracts.USDC.abi
  const circletokenAbi = ABI.abi
  const bridgetokenAddress = CONTRACTS[42421][0].contracts.USDC.address // you can choose any token of your choose, USDC,USDT,DAI
  const bridgetokenAbi = CONTRACTS[42421][0].contracts.USDC.abi
  const tokenContract = await ethers.getContractAt(tokenAbi, tokenAddress)
  const bridgetokenContract = await ethers.getContractAt(
    bridgetokenAbi,
    bridgetokenAddress
  )
  const owner = signers[0]
  const user = signers[1]

  return {
    bridgetransferAbi,
    bridgeMintAbi,
    bridgeNativeAbi,
    owner,
    user,
    bridgetokenAbi,
    bridgetokenAddress,
    chainId,
    tokenAddress,
    tokenAbi,
    bridgetokenContract,
    tokenContract,
    circletokenAbi,
  }
}

async function addChains(config: any, chainId: string, bridgeAssist: Contract) {
  const { owner } = config

  chainId = `evm.${chainId}`
  const MANAGER_ROLE = await bridgeAssist.MANAGER_ROLE()
  console.log(colors.green(`Manager role ${MANAGER_ROLE}`))
  const hasRole = await bridgeAssist.hasRole(MANAGER_ROLE, owner.address)
  if (!hasRole) {
    console.warn(`${owner.address} doesn't have manager role. Granting role...`)
    const tx: ContractTransaction = await bridgeAssist
      .connect(owner)
      .grantRole(MANAGER_ROLE, owner.address)
    await tx.wait(1)
    console.log(`Granted ${owner.address} manager role`, `hash ${tx.hash}`)
  }
  console.log(colors.yellow(`adding chain ${chainId}`))
  const tx: ContractTransaction = await bridgeAssist
    .connect(owner)
    .addChains([chainId], [1])
  await tx.wait(1)
  console.log(colors.green(`added chain ${chainId} Hash ${tx.hash}`))
}

async function getUserTransactions(config: any, user: string, bridgeAssist: Contract) {
  const ts: Transaction[] = await bridgeAssist.getUserTransactions(user)
  if (ts.length <= 0)
    return console.log(colors.yellow(`user ${user} has no transactions`))
  for (let i = 0; i < ts.length; i++) {
    const t = ts[i]
    console.log(colors.green(`index ${i}`))
    console.log(colors.green(`Amount ${BigNumber.from(t.amount).toString()}`))
    console.log(colors.green(`toUser ${t.toUser}`))
    console.log(colors.green(`chain ${getChainName(t.toChain)}`))
    console.log(colors.green(`nonce ${t.nonce} `))
  }
}

async function send(
  config: any,
  _amount: string,
  toChain: string,
  bridgeAssist: Contract,
  type: BRIDGETYPE,
  tokenContract: Contract,
  tokenType: 'assetchain' | 'circle' | 'default'
) {
  // if (type === BRIDGETYPE.NATIVE) throw new Error('Sending is not supported in Native bridge type')
  const { owner, chainId } = config
  console.log(colors.yellow(`checking if to chain is supported...`))
  const isSupportedChain = await bridgeAssist.isSupportedChain(`evm.${toChain}`)
  if (!isSupportedChain) {
    console.log(colors.yellow(`chain not supported...`))
    console.log(colors.yellow(`adding chain...`))
    await addChains(config, toChain, bridgeAssist)
  } else {
    console.log(colors.green(`to chain is supported...`))
  }
  let decimals: number
  if (type !== BRIDGETYPE.NATIVE) {
    decimals = await tokenContract.decimals()
    console.log(colors.blue(`token decimals ${decimals}...`))
  }

  let allowance: BigNumber
  if ((type !== BRIDGETYPE.MINT && type !== BRIDGETYPE.NATIVE) || tokenType === 'circle') {
    allowance = await tokenContract.allowance(owner.address, bridgeAssist.address)
    console.log(
      colors.blue(`bridge assist allowance ${BigNumber.from(allowance).toString()}...`)
    )
  }
  let amount: BigNumber
  if (type === BRIDGETYPE.NATIVE) {
    amount = ethers.utils.parseEther(_amount)
  } else {
    amount = ethers.utils.parseUnits(_amount.toString(), decimals!)
  }

  if ((type !== BRIDGETYPE.MINT && type !== BRIDGETYPE.NATIVE && amount.gt(allowance!)) || (tokenType === 'circle' && amount.gt(allowance!))) {
    console.log(colors.yellow(`amount to be sent is greater than allowance`))
    console.log(colors.yellow(`approving tokens...`))
    let tx: ContractTransaction
    {
      tx = await tokenContract.connect(owner).approve(bridgeAssist.address, amount)
    }
    console.log(colors.green(`tokens apppoved ${tx.hash}`))
  }

  if (type === BRIDGETYPE.MINT && tokenType === 'assetchain') {
    const BURNER_ROLE = await tokenContract.BURNER_ROLE()
    console.log(colors.green(`BURNER ROLE ${BURNER_ROLE}`))
    const hasRole = await tokenContract.hasRole(BURNER_ROLE, bridgeAssist.address)
    if (!hasRole) {
      console.log(colors.yellow(`bridge assist does not have Burner role`))
      console.log(colors.yellow(`granting role...`))
      const tx: ContractTransaction = await tokenContract.grantRole(
        BURNER_ROLE,
        bridgeAssist.address
      )
      await tx.wait(1)
      console.log(colors.green(`role granted. Hash: ${tx.hash}...`))
    }
  }
  console.log(amount.toString(), toChain, 'dks')
  if (type === BRIDGETYPE.NATIVE) {
    const tx2: ContractTransaction = await bridgeAssist
      .connect(owner)
      .send(
        amount,
        owner.address,
        `evm.${toChain}`,
        type === BRIDGETYPE.NATIVE ? { value: amount } : undefined
      )
    console.log(
      colors.green(
        `tokens sent to bridgeAssist ${bridgeAssist.address} ${getChainName(
          `evm.${chainId}`
        )} ${tx2.hash}`
      )
    )
  }

  // console.log(amount.toString(), toChain, 'dks')
  else {
    const tx2: ContractTransaction = await bridgeAssist
      .connect(owner)
      .send(amount, owner.address, `evm.${toChain}`)
    console.log(
      colors.green(
        `tokens sent to bridgeAssist ${bridgeAssist.address} ${getChainName(
          `evm.${chainId}`
        )} ${tx2.hash}`
      )
    )
  }
}

async function claim(
  config: any,
  fultx: FulfillTx,
  bridgeAssist: Contract,
  type: BRIDGETYPE,
  signatures: string[],
  tokenContract: Contract,
  tokenType: 'assetchain' | 'circle' | 'default'
) {
  const { owner, bridgetokenContract, chainId } = config
  console.log(colors.yellow(`checking if to chain is supported...`))
  const isSupportedChain = await bridgeAssist.isSupportedChain(fultx.fromChain)
  if (!isSupportedChain) {
    console.log(colors.yellow(`chain not supported...`))
    console.log(colors.yellow(`adding chain...`))
    const chain = fultx.fromChain.replace('evm.', '')
    await addChains(config, chain, bridgeAssist)
  } else {
    console.log(colors.green(`to chain is supported...`))
  }

  if (type === BRIDGETYPE.MINT && tokenType === 'assetchain') {
    const MINTER_ROLE = await tokenContract.MINTER_ROLE()
    console.log(colors.green(`Minter role ${MINTER_ROLE}`))
    const hasRole = await tokenContract.hasRole(MINTER_ROLE, bridgeAssist.address)
    if (!hasRole) {
      console.log(colors.yellow(`bridge does not have role ${MINTER_ROLE}`))
      console.log(colors.yellow(`granting Minter role`))
      const tx: ContractTransaction = await tokenContract
        .connect(owner)
        .grantRole(MINTER_ROLE, bridgeAssist.address)
      await tx.wait(1)
      console.log(colors.green(`role granted ${tx.hash}`))
    }
  }

  if (type === BRIDGETYPE.TRANSFER) {
    const decimals = await tokenContract.decimals()
    console.log(colors.green(`Token Decimals ${decimals}`))
    console.log(colors.yellow(`Getting bridge assist token balance...`))
    const balance = await tokenContract.balanceOf(bridgeAssist.address)
    console.log(colors.green(`Bridge Assit Token Balance ${balance}`))
    if (+balance < +fultx.amount) {
      console.log(colors.yellow(`Bridge assist does not have enough tokens. sending...`))
      const tx: ContractTransaction = await tokenContract.transfer(
        bridgeAssist.address,
        fultx.amount
      )
      await tx.wait(1)
      console.log(colors.green(`Transfer of tokens done ${tx.hash}`))
    }
  }

  const trx: any = { ...fultx }

  const tx: ContractTransaction = await bridgeAssist
    .connect(owner)
    .fulfill(trx, signatures)
  await tx.wait(1)
  console.log(
    colors.green(`tokens claim to ${getChainName(`evm.${chainId}`)} ${tx.hash}`)
  )
}
function isNumeric(str: string) {
  return /^[0-9]+$/.test(str)
}

function getChainName(chain: string) {
  switch (chain) {
    case 'evm.97':
      return 'BSC'
    case 'evm.42421':
      return 'Asset Chain'
    case 'evm.421614':
      return 'Arbitrium Sepolia'
    case 'evm.200810':
      return 'Bitlayer Testnet'
    case 'evm.84532':
      return 'Base Sepolia'
    default:
      return 'Unknown'
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
function initMessage() {
  console.log(colors.blue('system: ') + `Select your action`)
  console.log(colors.blue('1: ') + `add a chain`)
  console.log(colors.blue('2: ') + `send a token to another chain`)
  console.log(colors.blue('3: ') + `claim token from another chain`)
  console.log(colors.blue('4: ') + `get user transactions`)
  console.log(colors.blue('5: ') + `quit process`)
}
function chainTypeMessage() {
  console.log(colors.blue('system: ') + `Select Chain`)
  console.log(colors.blue('1:  ') + `Asset Chain`)
  console.log(colors.blue('2:  ') + `BSC chain`)
  console.log(colors.blue('3:  ') + `Sepolia Chain`)
  console.log(colors.blue('4:  ') + `Base Sepolia Chain`)
  console.log(colors.blue('5:  ') + `BitLayer Testnet`)
  console.log(colors.blue('6:  ') + `quit process`)
}

function bridgeTypeMessage() {
  console.log(colors.blue('system: ') + `Select bridge type`)
  console.log(colors.blue('1:  ') + `Transfer type`)
  console.log(colors.blue('2:  ') + `Mint type`)
  console.log(colors.blue('3:  ') + `Native type`)
}

function _chainType(answer: string) {
  if (!isNumeric(answer)) {
    console.log(colors.yellow('system: ') + `Invalid choice ${answer}`)
    return
  }
  return +answer
}

function tokenTypeMessage() {
  console.log(colors.blue('system: ') + `Select Token Type`)
  console.log(colors.blue('1:  ') + `Asset Chain Bridge Type`)
  console.log(colors.blue('2:  ') + `Circle Bridge Type`)
  console.log(colors.blue('3:  ') + `quit process`)
}

function _tokenType(answer: string) {
  if (!isNumeric(answer)) {
    console.log(colors.yellow('system: ') + `Invalid choice ${answer}`)
    return
  }
  return +answer
}

function getChainIdFromChoice(answer: number) {
  switch (answer) {
  }
}

async function initBridgeAssit(config: any) {
  const {
    bridgetransferAbi,
    bridgeMintAbi,
    bridgeNativeAbi,
    bridgetokenAbi,
    tokenAbi,
    circletokenAbi,
  } = config
  console.log(colors.bold.yellow('Input bridge assist address: '))
  const bridgeAddress = readlineSync.question(colors.bold.yellow('Input address: '))

  bridgeTypeMessage()

  while (true) {
    const bridgeType = readlineSync.question(colors.bold.yellow('Your choice: '))
    if (!isNumeric(bridgeType)) {
      console.log(colors.bold.yellow(`Invalid choice: ${bridgeType}`))
      continue
    } else {
      const choice = +bridgeType
      if (choice === 4) {
        console.log(colors.yellow('Exiting...'))
        process.exit(1)
      } else if (choice > 4 || choice < 1) {
        console.log(colors.bold.yellow(`Invalid choice: ${bridgeType}`))
        continue
      }

      let bridgeAssist: Contract | undefined = undefined
      let type: BRIDGETYPE | undefined = undefined
      let tokenContract: Contract | undefined = undefined
      let tokenName: string = ''
      let tokenType: 'assetchain' | 'circle' | 'default' = 'default'
      let _address: string = ''
      switch (choice) {
        case 1:
          bridgeAssist = await ethers.getContractAt(bridgetransferAbi, bridgeAddress)
          type = BRIDGETYPE.TRANSFER
          break
        case 2:
          bridgeAssist = await ethers.getContractAt(bridgeMintAbi, bridgeAddress)
          type = BRIDGETYPE.MINT
          tokenTypeMessage()
          const _tokenTypechoice = readlineSync.question(
            colors.bold.yellow('Your choice: ')
          )
          let choice = _tokenType(_tokenTypechoice)
          if (!choice) continue
          if (choice > 2) return process.exit(1)
          tokenType = choice === 1 ? 'assetchain' : choice === 2 ? 'circle' : 'default'
          break
        case 3:
          bridgeAssist = await ethers.getContractAt(bridgeNativeAbi, bridgeAddress)
          type = BRIDGETYPE.NATIVE
          break
      }

      if (bridgeAssist) {
        if (type === BRIDGETYPE.NATIVE) {
          _address = '0x0000000000000000000000000000000000000001'
        } else {
          _address = tokenContract = await bridgeAssist.TOKEN()
        }

        console.log(_address)
        if (type !== BRIDGETYPE.NATIVE) {
          if (tokenType === 'assetchain') {
            console.log(_address, type)
            tokenContract = await ethers.getContractAt(
              type === BRIDGETYPE.MINT ? bridgetokenAbi : tokenAbi,
              _address
            )
            console.log(_address, 'sdjshdjk')
          } else if (tokenType === 'circle') {
            tokenContract = await ethers.getContractAt(
              type === BRIDGETYPE.MINT ? circletokenAbi : tokenAbi,
              _address
            )
          } else {
            tokenContract = await ethers.getContractAt(
              type === BRIDGETYPE.MINT ? tokenAbi : tokenAbi,
              _address
            )
          }
          tokenName = await tokenContract.name()
        }
      }
      return { bridgeAssist, type, tokenContract, tokenName, tokenType, _address }
    }
  }
}
async function main() {
  console.log(`initializing contracts....`)
  const config = await init()
  console.log(`done....`)

  const bridge = await initBridgeAssit(config)
  if (!bridge || !bridge.bridgeAssist) throw new Error(`Bridge was not initialised!`)

  console.log(colors.green(`Bridge Assist address ${bridge.bridgeAssist.address}`))
  console.log(colors.green(`Bridge type ${bridge.type}`))
  if (bridge.tokenContract) {
    console.log(colors.green(`Bridge token address ${bridge.tokenContract.address}`))
  }
  if (bridge.tokenName) {
    console.log(colors.green(`token name ${bridge.tokenName}`))
  }

  if (bridge.type === BRIDGETYPE.MINT) {
    console.log(colors.green(`token type ${bridge.tokenType}`))
  }

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
        chainTypeMessage()
        const chainTypeChoice = readlineSync.question(colors.bold.yellow('Your choice: '))
        const type = _chainType(chainTypeChoice)
        if (!type) continue
        if (type > 5) return (running = false)
        const chain =
          type === 1
            ? '42421'
            : type === 2
            ? '97'
            : type === 3
            ? '421614'
            : type === 4
            ? '84532'
            : '200810'
        try {
          await addChains(config, chain, bridge.bridgeAssist)
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 2:
        console.log('send')
        chainTypeMessage()
        const chainType = readlineSync.question(colors.bold.yellow('Your choice: '))
        const _type = _chainType(chainType)
        if (!_type) continue
        if (_type > 5) return (running = false)
        const _chain =
          _type === 1
            ? '42421'
            : _type === 2
            ? '97'
            : _type === 3
            ? '421614'
            : _type === 4
            ? '84532'
            : '200810'
        // const isAddress = ethers.utils.isAddress(choiceAdd)
        // if (!isAddress) {
        //   console.log(colors.red(`Invalid address ${choiceAdd}`))
        //   continue
        // }
        console.log(colors.blue('enter amount to send'))
        const _amount = readlineSync.question(colors.bold.yellow('input amount: '))
        // if (!isNumeric(_amount)) {
        //   console.log(colors.yellow(`invalid amount ${_amount}`))
        //   continue
        // }
        try {
          await send(
            config,
            _amount,
            _chain,
            bridge.bridgeAssist,
            bridge.type!,
            bridge.tokenContract!,
            bridge.tokenType
          )
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 3:
        chainTypeMessage()
        const _fromChain = readlineSync.question(colors.bold.yellow('Your choice: '))
        const _from_chain = _chainType(_fromChain)
        if (!_from_chain) continue
        if (_from_chain > 5) return (running = false)
        const _chain_ =
          _from_chain === 1
            ? '42421'
            : _from_chain === 2
            ? '97'
            : _from_chain === 3
            ? '421614'
            : _from_chain === 4
            ? '84532'
            : '200810'
        console.log(colors.blue('enter amount to claim'))
        const _amounttoClaim = readlineSync.question(colors.bold.yellow('input amount: '))
        if (!isNumeric(_amounttoClaim)) {
          console.log(colors.yellow(`invalid amount ${_amounttoClaim}`))
          continue
        }
        console.log(colors.blue('enter transaction nonce'))
        const nonce = readlineSync.question(colors.bold.yellow('input nonce: '))
        if (!isNumeric(nonce)) {
          console.log(colors.yellow(`invalid amount ${nonce}`))
          continue
        }

        console.log(colors.blue('enter relayer signature'))
        const signature = readlineSync.question(colors.bold.yellow('input signature: '))

        const fulfilTx: FulfillTx = {
          amount: _amounttoClaim,
          fromChain: `evm.${_chain_}`,
          fromUser: config.owner.address,
          toUser: config.owner.address,
          nonce,
        }
        try {
          await claim(
            config,
            fulfilTx,
            bridge.bridgeAssist,
            bridge.type!,
            [signature],
            bridge.tokenContract!,
            bridge.tokenType
          )
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 4:
        console.log(colors.blue('enter user address'))
        const user = readlineSync.question(colors.bold.yellow('input address: '))
        try {
          await getUserTransactions(config, user, bridge.bridgeAssist)
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

main().catch(console.error)
