import readlineSync from 'readline-sync'
import colors from 'colors'
import { ethers } from 'hardhat'
import * as CONTRACTS from '../contracts.json'
import { Contract, ContractTransaction } from 'ethers'
async function init() {
  const { chainId, name } = await ethers.provider.getNetwork()
  console.log(colors.bold.yellow(`ChainId ${chainId} network ${name}`))
  const signers = await ethers.getSigners()
  if (signers.length <= 0) throw new Error(`Signers must be at least 2`)
  const tokenAbi = CONTRACTS['42421'][0].contracts.USDC.abi
  if (!tokenAbi) throw new Error(`Contract ABI not found!`)
  const owner = signers[0]
  const user = signers[1]

  return {
    owner,
    user,
    tokenAbi,
  }
}

async function initTokenContract(config: any) {
  const { tokenAbi } = config
  console.log(colors.bold.yellow('Input Token address: '))
  let tokenContract: Contract
  let tokenAddress: string

  while (true) {
    tokenAddress = readlineSync.question(colors.bold.yellow('Input address: '))
    if (!ethers.utils.isAddress(tokenAddress)) {
      console.log(colors.bold.yellow(`${tokenAddress} is not a valid address`))
      continue
    } else {
      tokenContract = await ethers.getContractAt(tokenAbi, tokenAddress)
      break
    }
  }

  const [name, symbol, decimals] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.decimals(),
  ])

  return {
    tokenContract,
    symbol,
    name,
    tokenAddress,
    decimals,
  }
}

async function hasRole(tokenContract: Contract, address: string) {
  console.log(colors.yellow(`Getting roles for ${address}`))
  const [MINTER_ROLE, BURNER_ROLE] = await Promise.all([
    tokenContract.MINTER_ROLE(),
    tokenContract.BURNER_ROLE(),
  ])
  const [hasMintRole, hasBurnRole] = await Promise.all([
    tokenContract.hasRole(MINTER_ROLE, address),
    tokenContract.hasRole(BURNER_ROLE, address),
  ])
  if (hasBurnRole) {
    console.log(colors.green(`${address} has burner role`))
  } else {
    console.log(colors.red(`${address} does not have burner role`))
  }

  if (hasMintRole) {
    console.log(colors.green(`${address} has Minter role`))
  } else {
    console.log(colors.red(`${address} does not have Miner role`))
  }
}

async function grantRole(
  tokenContract: Contract,
  address: string,
  role: 'mint' | 'burn'
) {
  console.log(colors.yellow(`Granting ${address} ${role} role`))
  if (role === 'mint') {
    const MINTER_ROLE = await tokenContract.MINTER_ROLE()
    const tx: ContractTransaction = await tokenContract.grantRole(MINTER_ROLE, address)
    await tx.wait(1)
    console.log(colors.green(`Granted ${address} mint role. Hash: ${tx.hash}`))
  } else {
    const BURNER_ROLE = await tokenContract.BURNER_ROLE()
    const tx: ContractTransaction = await tokenContract.grantRole(BURNER_ROLE, address)
    await tx.wait(1)
    console.log(colors.green(`Granted ${address} burn role. Hash: ${tx.hash}`))
  }
}

async function mintBurnToken(
  config: any,
  tokenContract: Contract,
  amount: string,
  decimals: number,
  action: 'mint' | 'burn'
) {
  const { owner } = config
  if (action === 'mint') {
    const MINTER_ROLE = await tokenContract.MINTER_ROLE()
    const hasRole = await tokenContract.hasRole(MINTER_ROLE, owner.address)
    if (!hasRole) throw new Error(`${owner.address} does not have minter role`)
    const _amount = ethers.utils.parseUnits(amount, decimals)
    console.log(colors.green(`Minting ${_amount.toNumber()} to ${owner.address}....`))
    const tx: ContractTransaction = await tokenContract
      .connect(owner)
      .mint(owner.address, _amount)
    await tx.wait(1)
    console.log(
      colors.green(`Minted ${_amount.toNumber()} to ${owner.address} Hash: ${tx.hash}`)
    )
  } else {
    const BURNER_ROLE = await tokenContract.BURNER_ROLE()
    const hasRole = await tokenContract.hasRole(BURNER_ROLE, owner.address)
    if (!hasRole) throw new Error(`${owner.address} does not have minter role`)
    const _amount = ethers.utils.parseUnits(amount, decimals)
    console.log(colors.green(`Burning ${_amount.toNumber()} to ${owner.address}....`))
    const tx: ContractTransaction = await tokenContract
      .connect(owner)
      .burn(owner.address, _amount)
    await tx.wait(1)
    console.log(
      colors.green(`Burned ${_amount.toNumber()} to ${owner.address} Hash: ${tx.hash}`)
    )
  }
}

async function transferToken(
  config: any,
  tokenContract: Contract,
  amount: string,
  decimals: number,
  toaddress: string
) {
  const { owner } = config
  const balance = await tokenContract.balanceOf(owner.address)
  const _amount = ethers.utils.parseUnits(amount, decimals)
  console.log(
    colors.blue(
      `Owner balance ${balance.toNumber()}. Amount to send ${_amount.toNumber()}`
    )
  )
  if (_amount.gt(balance)) throw new Error(`Insuficient balance`)
  console.log(colors.green(`Sending ${_amount.toNumber()} to ${toaddress}....`))
  const tx: ContractTransaction = await tokenContract
    .connect(owner)
    .transfer(toaddress, _amount)
  await tx.wait(1)
  console.log(colors.green(`Sent ${_amount.toNumber()} to ${toaddress} Hash: ${tx.hash}`))
}

async function approveSpender(
  config: any,
  tokenContract: Contract,
  amount: string,
  decimals: number,
  spenderaddress: string
) {
  const { owner } = config
  const _amount = ethers.utils.parseUnits(amount, decimals)
  console.log(colors.green(`Approve ${spenderaddress} to Spend ${_amount.toNumber()}`))
  const tx: ContractTransaction = await tokenContract
    .connect(owner)
    .approve(spenderaddress, _amount)
  await tx.wait(1)
  console.log(colors.green(`Approval Successful Hash: ${tx.hash}`))
}

async function main() {
  console.log(`initializing contracts....`)
  const config = await init()
  console.log(`done....`)

  const token = await initTokenContract(config)
  if (!token || !token.tokenContract || !token.tokenAddress)
    throw new Error(`Token was not initialised!`)

  console.log(
    colors.green(`Asset Chain Bridge Token address ${token.tokenContract.address}`)
  )
  console.log(colors.green(`token anme ${token.name}`))
  console.log(colors.green(`Token Symbol ${token.symbol}`))
  console.log(colors.green(`Token Decimals ${token.decimals}`))

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
        console.log(colors.yellow('Enter address'))
        const address = readlineSync.question(colors.bold.yellow('Address: '))
        try {
          await hasRole(token.tokenContract, address)
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 2:
        console.log(colors.yellow('Enter address'))
        const roleaddress = readlineSync.question(colors.bold.yellow('Address: '))
        try {
          await grantRole(token.tokenContract, roleaddress, 'mint')
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 3:
        console.log(colors.yellow('Enter address'))
        const roleaddressburn = readlineSync.question(colors.bold.yellow('Address: '))
        try {
          await grantRole(token.tokenContract, roleaddressburn, 'burn')
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 4:
        console.log(colors.yellow('Enter Mint Amount'))
        const mintAmount = readlineSync.question(colors.bold.yellow('Amount: '))
        const _mAmount = checkNum(mintAmount)
        if (!_mAmount) continue
        try {
          await mintBurnToken(
            config,
            token.tokenContract,
            _mAmount.toString(),
            token.decimals,
            'mint'
          )
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break

      case 5:
        console.log(colors.yellow('Enter Burn Amount'))
        const burnAmount = readlineSync.question(colors.bold.yellow('Amount: '))
        const _bAmount = checkNum(burnAmount)
        if (!_bAmount) continue
        try {
          await mintBurnToken(
            config,
            token.tokenContract,
            _bAmount.toString(),
            token.decimals,
            'burn'
          )
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 6:
        console.log(colors.yellow('Enter Amount to Send'))
        const sendAmount = readlineSync.question(colors.bold.yellow('Amount: '))
        const _sAmount = checkNum(sendAmount)
        if (!_sAmount) continue
        console.log(colors.yellow('Enter Address to Send to'))
        const toaddress = readlineSync.question(colors.bold.yellow('Amount: '))
        if (!ethers.utils.isAddress(toaddress)) {
          console.log(colors.red(`Invalid Address ${toaddress}`))
          continue
        }
        try {
          await transferToken(
            config,
            token.tokenContract,
            _sAmount.toString(),
            token.decimals,
            toaddress
          )
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 7:
        console.log(colors.yellow('Enter Amount to Approve'))
        const approveAmount = readlineSync.question(colors.bold.yellow('Amount: '))
        const _aAmount = checkNum(approveAmount)
        if (!_aAmount) continue
        console.log(colors.yellow('Enter Spender Address'))
        const spenderaddress = readlineSync.question(colors.bold.yellow('Address: '))
        if (!ethers.utils.isAddress(spenderaddress)) {
          console.log(colors.red(`Invalid Address ${spenderaddress}`))
          continue
        }
        try {
          await approveSpender(
            config,
            token.tokenContract,
            _aAmount.toString(),
            token.decimals,
            spenderaddress
          )
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 8:
        console.log(colors.yellow('Enter Address'))
        const _address = readlineSync.question(colors.bold.yellow('Address: '))
        if (!ethers.utils.isAddress(_address)) {
          console.log(colors.red(`Invalid Address ${_address}`))
          continue
        }
        try {
          const balance = await token.tokenContract.balanceOf(_address)
          console.log(colors.green(`${ethers.utils.formatUnits(balance, token.decimals)} ${token.symbol}`))
        } catch (error: any) {
          console.log(colors.red(`Error ${error.message}`))
        }
        break
      case 9:
        running = false
        console.log(colors.yellow('Exiting...'))
        break
      default:
        console.log(colors.yellow('Invalid Choice'))
        break
    }
  }
}

function isNumeric(str: string) {
  return /^[0-9]+$/.test(str)
}

function initMessage() {
  console.log(colors.blue('system: ') + `Select your action`)
  console.log(colors.blue('1: ') + `View Roles`)
  console.log(colors.blue('2: ') + `Grant Minter Role`)
  console.log(colors.blue('3: ') + `Grant Burner Role`)
  console.log(colors.blue('4: ') + `Mint Tokens`)
  console.log(colors.blue('5: ') + `Burn Tokens`)
  console.log(colors.blue('6: ') + `Transfer tokens`)
  console.log(colors.blue('7: ') + `Approve Spender`)
  console.log(colors.blue('8: ') + `Balance of`)
  console.log(colors.blue('9: ') + `quit process`)
}

// function roleTypeMessage() {
//   console.log(colors.blue('system: ') + `Select role`)
//   console.log(colors.blue('1:  ') + `Minter Role`)
//   console.log(colors.blue('2:  ') + `Burner Role`)
//   console.log(colors.blue('5:  ') + `quit process`)
// }

function checkNum(answer: string) {
  if (!isNumeric(answer)) {
    console.log(colors.yellow('system: ') + `Invalid choice ${answer}`)
    return
  }
  return +answer
}

main().catch(console.error)
