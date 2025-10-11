import { Wallet, ethers, BigNumber, BigNumberish, providers, utils } from 'ethers'
import { useContracts, getProvider, safeRead } from '@/gotbit-tools/node'
import { config } from '@/gotbit.config'
import { ChainId } from '@/gotbit-tools/node/types'
import CONFIRMATIONS from '../confirmations.json'
import { FulfillTxContract, ITransaction, TransactionContract } from '@/types'
import {
  BRIDGEASSISTS,
  chainBridgeAssit,
  EIP712DOMAIN_NAME,
  EIP712DOMAIN_VERSION,
  eip712Transaction,
} from '@/utils/constant'
import axios from 'axios'
import {
  extractTransaction,
  getAssociatedTokenAddress,
  getConfirmationsRequired,
  getOrCreateAssociatedTokenAccount,
  getSolanaSendTx,
  hasPassedConfirmationSolana,
  isToSolanaTxFulfilled,
  signSolana,
  solanaWorkspace,
} from '@/utils/solana/helpers'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { _getProvider, hasPassedConfirmationEvm } from '@/utils/helpers'
import { anyBridgeAssist, anyToken } from '@/utils/useContracts'
import { relayerIndex } from '@/utils/env-var'
import { BridgeAssist, Token } from '@/contracts/typechain'
import { transactionRepo } from '@/lib/database'

export const getWalletEVM = () => new Wallet(process.env.PRIVATE_KEY!)

const getWallet = (signerIndex: number) => {
  if (signerIndex === 0) {
    return new Wallet(process.env.PRIVATE_KEY, getProvider(config.DEFAULT_CHAINID))
  }
  return new Wallet(process.env.PRIVATE_KEY2!, getProvider(config.DEFAULT_CHAINID))
}

async function signHashedTransaction(
  transaction: FulfillTxContract,
  chainId: string,
  contractAddress: string,
  signerIndex: number
) {
  const wallet = getWallet(signerIndex)
  const domain = {
    name: EIP712DOMAIN_NAME,
    version: EIP712DOMAIN_VERSION,
    chainId,
    verifyingContract: contractAddress,
  }
  const types = {
    [eip712Transaction.name]: eip712Transaction.fields,
  }

  const sign = await wallet._signTypedData(domain, types, transaction)
  return sign
}

const extractFulfillTransaction = (tx: TransactionContract | ITransaction) => {
  return {
    amount: tx.amount.toString(),
    fromChain: tx.fromChain.toString(),
    nonce: tx.nonce.toString(),
    fromUser: tx.fromUser.toString(),
    toUser: tx.toUser.toString(),
  }
}

export const signTransaction = async (
  fromBridgeAddress: string,
  toBridgeAddress: string,
  fromChain: string,
  fromUser: string,
  index: string,
  transactionId: string,
  req: any
) => {
  let tx: TransactionContract
  let relayers = 1
  // if (!fromChain.startsWith('evm.')) throw Error(`Relayer ${relayerIndex} Bad arguments`)
  if (process.env.IS_PUBLIC_RELAYER === 'true') {
  const dbTransaction = await transactionRepo.findOne({ id: transactionId })
  if (!dbTransaction) throw Error('Transaction not found')
  }
  const _fromChain = fromChain.replace('evm.', '') as ChainId
  const _provider = await _getProvider(_fromChain)
  const contract = anyBridgeAssist(fromBridgeAddress, _provider)
  const transactionPromise = contract.transactions(fromUser, index)
  const relayerLengthPromise = contract.relayersLength()
  const res = await Promise.all([transactionPromise, relayerLengthPromise])
  tx = res[0]
  if (!tx || tx.block.toNumber() === 0) throw Error('Transaction not found')
  if (
    _fromChain === '42161' ||
    (_fromChain === '421614' && process.env.IS_PUBLIC_RELAYER === 'true')
  )
    await checkToken(fromUser, contract, _fromChain, tx)

  relayers = +res[1].toNumber()

  // const provider = getProvider(fromChain.slice(4) as ChainId)
  const currentBlock = await safeRead(_provider.getBlockNumber(), 0)
  if (currentBlock === 0 || tx.block.gt(currentBlock))
    throw Error(`Relayer ${relayerIndex} waiting for confirmations`)

  if (!tx.toChain.startsWith('evm.'))
    throw Error(`Relayer ${relayerIndex} bad contract params`)
  const { isFulfilled } = await fulfilledInfo(tx, toBridgeAddress)
  if (isFulfilled) {
    if (process.env.IS_PUBLIC_RELAYER === 'true') {
      await transactionRepo.update(transactionId, { fulfilled: true })
    }
    throw new Error('Token has already claimed')
  }

  // if (tx.toChain.startsWith('evm.')) {
  const chainId = tx.toChain.replace('evm.', '')
  // const { bridgeAssist } = useContracts(undefined, chainId as ChainId)
  let signatures: string[] = []
  const allowedIps = process.env.ALLOWED_IPS?.split(',')
  const clientIp = getClientIp(req)
  if (process.env.IS_PUBLIC_RELAYER === 'false') {
    if (!allowedIps?.includes(clientIp)) {
      throw new Error(`Relayer ${relayerIndex} IP not allowed to connect to the relayer`)
    }
  }
  const signer0 = await signHashedTransaction(
    extractFulfillTransaction(tx),
    chainId,
    toBridgeAddress,
    0
  )
  signatures.push(signer0)
  if (process.env.IS_PUBLIC_RELAYER === 'true' && relayers > 1) {
    const relayer1Url = process.env.RELAYER1_URL
    const relayer2Url = process.env.RELAYER2_URL

    const promises = [
      getSignaturesFromRelayer(relayer1Url, req.query),
      getSignaturesFromRelayer(relayer2Url, req.query),
    ]
    const results = await Promise.all(promises)
    signatures = signatures.concat(results[0], results[1])
  }
  return signatures
  // } else {
  //   throw Error('bad contract params')
  // }
}

async function getSignaturesFromRelayer(relayerUrl: string, searchParams: any) {
  const res = await axios.get(geturl(relayerUrl, searchParams))
  return res.data.signature
}

function geturl(baseUrl: string, searchParams: any) {
  const url = new URL(baseUrl)
  Object.keys(searchParams).forEach((k) => {
    url.searchParams.set(k, searchParams[k])
  })
  return url.toString()
}

function getClientIp(req: any) {
  // Check Cloudflare headers first
  if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip']
  }

  // Fallback to X-Forwarded-For (split and take the first IP)
  const xForwardedFor = req.headers['x-forwarded-for']
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }

  // Default to direct connection IP
  return req.connection.remoteAddress
}

export async function signEvmToSolana(
  fromChainId: string,
  fromBridgeAddress: string,
  toBridgeAddress: string,
  fromUser: string,
  index: string,
  _tokenMint: string,
  transactionId: string
) {
  const { connection, owner, tokenMint } = solanaWorkspace(toBridgeAddress, _tokenMint)
  // console.log(connection, 'connection')
  if (process.env.IS_PUBLIC_RELAYER === 'true') {
    const dbTransaction = await transactionRepo.findOne({ id: transactionId })
    if (!dbTransaction) throw Error('Transaction not found')
  }
  const fromChain = fromChainId.replace('evm.', '') as ChainId
  const _provider = await _getProvider(fromChain)
  const contract = anyBridgeAssist(fromBridgeAddress, _provider)
  const tx = await contract.transactions(fromUser, index)
  const userSolana = tx.toUser
  const userTokenAccountKey = await getOrCreateAssociatedTokenAccount(
    connection,
    tokenMint,
    new PublicKey(userSolana),
    owner
  )
  const extractedTx = extractTransaction(tx)

  if (await isToSolanaTxFulfilled(toBridgeAddress, _tokenMint, fromChain, tx.nonce)) {
    if (process.env.IS_PUBLIC_RELAYER === 'true') {
      await transactionRepo.update(transactionId, { fulfilled: true })
    }
    throw Error('Already claimed')
  }

  const blockConfirmed = hasPassedConfirmationEvm(_provider, fromChain, tx.block)

  if (!blockConfirmed) throw Error('Not confirmed yet')

  const signature = await signSolana(
    toBridgeAddress,
    extractedTx,
    _tokenMint,
    userTokenAccountKey
  )

  return signature.toString('base64')
}

export async function signSolanaToEvm(
  req: any,
  fromChain: string,
  fromBridgeAddress: string,
  toBridgeAddress: string,
  userSolana: string,
  nonce: string,
  _tokenMint: string,
  transactionId: string
) {
  const { owner, program, connection, tokenMint } = solanaWorkspace(
    fromBridgeAddress,
    _tokenMint
  )
  if (process.env.IS_PUBLIC_RELAYER === 'true') {
    const dbTransaction = await transactionRepo.findOne({ id: transactionId })
    if (!dbTransaction) throw Error('Transaction not found')
  }
  const tx = await getSolanaSendTx(
    owner,
    tokenMint,
    program,
    new PublicKey(userSolana),
    nonce,
    fromChain
  )
  const _provider = await _getProvider(tx.toChain.replace('evm.', '') as ChainId)
  const contract = anyBridgeAssist(toBridgeAddress, _provider)

  const fulfilledAt = await safeRead(
    contract.fulfilledAt(tx.fromChain, tx.fromUser, tx.nonce),
    ethers.constants.Zero
  )
  const isClaimed = fulfilledAt.toNumber() !== 0

  if (isClaimed) {
    if (process.env.IS_PUBLIC_RELAYER === 'true') {
      await transactionRepo.update(transactionId, { fulfilled: true })
    }
    throw Error('Already claimed')
  }

  if (!(await hasPassedConfirmationSolana(connection, tx)))
    throw Error('Not confirmed yet')

  const relayerLength = await contract.relayersLength()
  const relayers = relayerLength.toNumber()
  const chainId = tx.toChain.replace('evm.', '')
  let signatures: string[] = []
  const allowedIps = process.env.ALLOWED_IPS?.split(',')
  const clientIp = getClientIp(req)
  if (process.env.IS_PUBLIC_RELAYER === 'false') {
    if (!allowedIps?.includes(clientIp)) {
      throw new Error(`Relayer ${relayerIndex} IP not allowed to connect to the relayer`)
    }
  }
  const fulfilTX = extractFulfillTransaction(tx)
  const signer0 = await signHashedTransaction(fulfilTX, chainId, toBridgeAddress, 0)
  signatures.push(signer0)
  if (process.env.IS_PUBLIC_RELAYER === 'true' && relayers > 1) {
    const relayersLength = relayers - 1
    const relayer1Url = process.env.RELAYER1_URL
    const relayer2Url = process.env.RELAYER2_URL
    const promises = [
      getSignaturesFromRelayer(relayer1Url, req.query),
      getSignaturesFromRelayer(relayer2Url, req.query),
    ]
    const results = await Promise.all(promises)
    signatures = signatures.concat(results[0], results[1])
  }
  return signatures
}

async function checkToken(
  user: string,
  bridgeAssist: BridgeAssist,
  fromChain: ChainId,
  transaction: TransactionContract
) {
  const timeStamp = Number(transaction.timestamp.toString())
  if (timeStamp < targetTimeStamp(fromChain)) {
    console.log('Transaction before target timestamp')
    console.log('no need to check')
    return
  }
  const provider = ARB_STATIC_PROVIDER(fromChain)
  const address = await bridgeAssist.TOKEN()
  const token = anyToken(address, provider)
  const symbol = await token.symbol()
  const isWNT = symbol === 'WNT'
  if (!isWNT) return
  await checkWNTRestriction(user, bridgeAssist, transaction, fromChain, token)
}

async function checkWNTRestriction(
  user: string,
  bridgeAssist: BridgeAssist,
  transaction: TransactionContract,
  fromChain: ChainId,
  token: Token
) {
  const timeStamp = targetTimeStamp(fromChain)
  const blockNumber = targetBlockNumber(fromChain)
  const transactions = await bridgeAssist.getUserTransactions(user)
  let totalBridged = 0

  await Promise.all(
    transactions.map(async (transaction) => {
      if (+transaction.timestamp.toString() < timeStamp) return
      const toChain = transaction.toChain.replace('evm.', '')
      const toBridgeAddress = (chainBridgeAssit as any)[toChain]
      console.log(toBridgeAddress, 'toBridgeAddress')
      if (!toBridgeAddress) throw new Error(`Failed to get to bridge Assist address`)
      const { isFulfilled } = await fulfilledInfo(transaction, toBridgeAddress)
      if (!isFulfilled) return
      const amount = +utils.formatUnits(transaction.amount, 18)
      totalBridged += amount
    })
  )

  const _canBridge = await token.balanceOf(user, { blockTag: blockNumber })
  const canBridge = +utils.formatUnits(_canBridge, 18)
  console.log(`Can bridge ${canBridge}`)
  console.log(`total bridged ${totalBridged}`)
  const amountWantToBridge = +utils.formatUnits(transaction.amount, 18)
  console.log(`amountWantToBridge ${amountWantToBridge}`)
  if (totalBridged + amountWantToBridge > canBridge) {
    const amountLeftToBridge = canBridge - totalBridged
    console.log(`Amount left to bridge ${amountLeftToBridge}`)
    throw new Error(`Amount left to bridge is ${amountLeftToBridge} WNT`)
  }
}

async function fulfilledInfo(tx: TransactionContract, bridgeAddress: string) {
  const toChain = tx.toChain.replace('evm.', '') as ChainId
  const provider = await _getProvider(toChain)
  const bridgeAssist = anyBridgeAssist(bridgeAddress, provider)
  const fulfilledAt = await bridgeAssist.fulfilledAt(tx.fromChain, tx.fromUser, tx.nonce)

  return {
    isFulfilled: Number(fulfilledAt) > 0,
    txBlock: tx.block as BigNumber,
    confirmations: CONFIRMATIONS[tx.fromChain.replace('evm.', '') as ChainId] as number,
  }
}

export type ARB_CHAINID = '42161' | '421614'
export const targetBlockNumber = (chainId: ChainId) =>
  chainId === '42161' ? 370576662 : 180981641
export const targetTimeStamp = (chainId: ChainId) =>
  chainId === '42161' ? 1755734340 : 1754406000

export const ARB_STATIC_PROVIDER = (chainId: ChainId) =>
  chainId === '42161'
    ? new providers.JsonRpcProvider('https://api.zan.top/arb-one')
    : new providers.JsonRpcProvider('https://api.zan.top/arb-sepolia')
