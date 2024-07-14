import readlineSync from 'readline-sync'
import colors from 'colors'
import { ethers } from 'hardhat'
import * as CONTRACTS from '../dev/contracts.json'
import { BigNumber, Contract, ContractTransaction } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

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
  console.log(signers.length, 'shj')
  if (signers.length <= 0) throw new Error(`Signers must be at least 2`)
  const contract = CONTRACTS[getIndex(chainId)]
  if (!contract) throw new Error(`Contract not deployed on network ${name} ${chainId}`)
  const bridgetransferAbi =
    CONTRACTS['421614'][0].contracts.BridgeAssistTransferUpgradeable.abi
  const bridgeMintAbi = CONTRACTS['42421'][0].contracts.BridgeAssistMintUpgradeable.abi
  const bridgeNativeAbi =
    CONTRACTS['42421'][0].contracts.BridgeAssistNativeUpgradeable.abi
  const tokenAddress = contract[0].contracts.USDC.address // you can choose any token of your choose, USDC,USDT,DAI
  const tokenAbi = contract[0].contracts.USDC.abi
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
  }
}

async function addChains(config: any, chainId: string, bridgeAssist: Contract) {
  const { bridgetransferAbi, bridgeMintAbi, bridgeNativeAbi, owner } = config
  //   let bridgeAssist: Contract
  //   if (type === BRIDGETYPE.TRANSFER) {
  //     bridgeAssist = await ethers.getContractAt(bridgetransferAbi, bridgeAddress)
  //   } else if (type === BRIDGETYPE.MINT) {
  //     bridgeAssist = await ethers.getContractAt(bridgeMintAbi, bridgeAddress)
  //   } else {
  //     bridgeAssist = await ethers.getContractAt(bridgeNativeAbi, bridgeAddress)
  //   }
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
  for (let i=0; i<ts.length; i++) {
    const t = ts[i]
    console.log(colors.green(`index ${i}`))
    console.log(colors.green(`Amount ${t.amount.toNumber()}`))
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
  type: BRIDGETYPE
) {
  const { owner, tokenContract, bridgetokenContract } = config
  console.log(colors.yellow(`checking if to chain is supported...`))
  toChain = `evm.${toChain}`
  const isSupportedChain = await bridgeAssist.isSupportedChain(toChain)
  if (!isSupportedChain) {
    console.log(colors.yellow(`chain not supported...`))
    console.log(colors.yellow(`adding chain...`))
    await addChains(config, toChain, bridgeAssist)
  } else {
    console.log(colors.green(`to chain is supported...`))
  }
  let decimals: number
  if (type === BRIDGETYPE.MINT) {
    decimals = await bridgetokenContract.decimals()
  } else {
    decimals = await tokenContract.decimals()
  }
  console.log(colors.blue(`token decimals ${decimals}...`))

  let allowance: BigNumber
  if (type !== BRIDGETYPE.MINT) {
    allowance = await tokenContract.allowance(owner.address, bridgeAssist.address)
    console.log(colors.blue(`bridge assist allowance ${allowance.toNumber()}...`))
  } 
  
  const amount = ethers.utils.parseUnits(_amount, decimals)

  if (type !== BRIDGETYPE.MINT && amount.gt(allowance!)) {
    console.log(colors.yellow(`amount to be sent is greater than allowance`))
    console.log(colors.yellow(`approving tokens...`))
    let tx: ContractTransaction
     {
      tx = await tokenContract.connect(owner).approve(bridgeAssist.address,amount)
    }
    console.log(colors.green(`tokens apppoved ${tx.hash}`))
  }

  const tx2: ContractTransaction = await bridgeAssist
    .connect(owner)
    .send(amount, owner.address, toChain)
  console.log(colors.green(`tokens sent to ${getChainName(toChain)} ${tx2.hash}`))
}

async function claim(
  config: any,
  fultx: FulfillTx,
  bridgeAssist: Contract,
  type: BRIDGETYPE,
  signatures: string[]
) {
  const { owner, tokenContract, bridgetokenContract, chainId } = config
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

  if (type === BRIDGETYPE.MINT) {
    const MINTER_ROLE = await bridgetokenContract.MINTER_ROLE()
    console.log(colors.green(`Minter role ${MINTER_ROLE}`))
    const hasRole = await bridgetokenContract.hasRole(MINTER_ROLE, bridgeAssist.address)
    if (!hasRole) {
      console.log(colors.yellow(`bridge does not have role ${MINTER_ROLE}`))
      console.log(colors.yellow(`granting Minter role`))
      const tx: ContractTransaction = await bridgetokenContract
        .connect(owner)
        .grantRole(MINTER_ROLE, bridgeAssist.address)
      await tx.wait(1)
      console.log(colors.green(`role granted ${tx.hash}`))
    }
  }

  const trx: any = { ...fultx }

  const tx: ContractTransaction = await bridgeAssist.connect(owner).fulfill(trx, signatures)
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
  console.log(colors.blue('4:  ') + `quit process`)
}

function bridgeTypeMessage() {
  console.log(colors.blue('system: ') + `Select bridge type`)
  console.log(colors.blue('1:  ') + `Transfer type`)
  console.log(colors.blue('2:  ') + `Mint type`)
  console.log(colors.blue('3:  ') + `Native type`)
}

function _chainType(answer: string) {
  if (!isNumeric(answer)) {
    console.log(colors.green('system: ') + `Invalid choice ${answer}`)
    return
  }
  return +answer
}

async function initBridgeAssit(config: any) {
    const { bridgetransferAbi, bridgeMintAbi, bridgeNativeAbi } = config;
    console.log(colors.bold.yellow('Input bridge assist address: '));
    const bridgeAddress = readlineSync.question(colors.bold.yellow('Input address: '));
  
    bridgeTypeMessage();
  
    while (true) {
      const bridgeType = readlineSync.question(colors.bold.yellow('Your choice: '));
      if (!isNumeric(bridgeType)) {
        console.log(colors.bold.yellow(`Invalid choice: ${bridgeType}`));
        continue;
      } else {
        const choice = +bridgeType;
        if (choice === 4) {
          console.log(colors.yellow('Exiting...'));
          process.exit(1);
        } else if (choice > 4 || choice < 1) {
          console.log(colors.bold.yellow(`Invalid choice: ${bridgeType}`));
          continue;
        }
  
        let bridgeAssist;
        let type;
        switch (choice) {
          case 1:
            bridgeAssist = await ethers.getContractAt(bridgetransferAbi, bridgeAddress);
            type = BRIDGETYPE.TRANSFER;
            break;
          case 2:
            bridgeAssist = await ethers.getContractAt(bridgeMintAbi, bridgeAddress);
            type = BRIDGETYPE.MINT;
            break;
          case 3:
            bridgeAssist = await ethers.getContractAt(bridgeNativeAbi, bridgeAddress);
            type = BRIDGETYPE.NATIVE;
            break;
        }
  
        return { bridgeAssist, type };
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
        if (type > 3) return (running = false)
        const chain = type === 1 ? '42421' : type === 2 ? '97' : '421614'
        try {
          await addChains(config, chain, bridge.bridgeAssist)
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 2:
        chainTypeMessage()
        const chainType = readlineSync.question(colors.bold.yellow('Your choice: '))
        const _type = _chainType(chainType)
        if (!_type) continue
        if (_type > 3) return (running = false)
        const _chain = _type === 1 ? '42421' : _type === 2 ? '97' : '421614'
        // const isAddress = ethers.utils.isAddress(choiceAdd)
        // if (!isAddress) {
        //   console.log(colors.red(`Invalid address ${choiceAdd}`))
        //   continue
        // }
        console.log(colors.blue('enter amount to send'))
        const _amount = readlineSync.question(colors.bold.yellow('input amount: '))
        if (!isNumeric(_amount)) {
            console.log(colors.yellow(`invalid amount ${_amount}`))
            continue
        }
        try {
          await send(config, _amount, _chain, bridge.bridgeAssist, bridge.type!)
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 3:
        chainTypeMessage()
        const _fromChain = readlineSync.question(colors.bold.yellow('Your choice: '))
        const _from_chain = _chainType(_fromChain)
        if (!_from_chain) continue
        if (_from_chain > 3) return (running = false)
        const _chain_ = _from_chain === 1 ? '42421' : _from_chain === 2 ? '97' : '421614'
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
        
        const fulfilTx: FulfillTx ={
            amount: _amounttoClaim,
            fromChain: `evm.${_chain_}`,
            fromUser: config.owner.address,
            toUser: config.owner.address,
            nonce

        }
        try {
          await claim(config, fulfilTx, bridge.bridgeAssist,bridge.type!, [signature])
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