import { Wallet, ethers, BigNumber, BigNumberish } from 'ethers'
import { useContracts, getProvider, safeRead } from '@/gotbit-tools/node'
import { config } from '@/gotbit.config'
import { ChainId } from '@/gotbit-tools/node/types'
import CONFIRMATIONS from '../confirmations.json'
import { FulfillTxContract, TransactionContract } from '@/types'
import {
  EIP712DOMAIN_NAME,
  EIP712DOMAIN_VERSION,
  eip712Transaction,
} from '@/utils/constant'
import axios from 'axios'
import { _getProvider } from '@/utils/helpers'
import { anyBridgeAssist } from '@/utils/useContracts'
import { relayerIndex } from '@/utils/env-var'

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

const extractFulfillTransaction = (tx: TransactionContract) => {
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
  req: any
) => {
  let tx: TransactionContract
  let relayers = 1
  if (!fromChain.startsWith('evm.')) throw Error(`Relayer ${relayerIndex} Bad arguments`)
  const _fromChain = fromChain.slice(4) as ChainId
  const _provider = await _getProvider(_fromChain)
  const contract = anyBridgeAssist(fromBridgeAddress, _provider)
  const transactionPromise = contract.transactions(fromUser, index)
  const relayerLengthPromise = contract.relayersLength()
  const res = await Promise.all([transactionPromise, relayerLengthPromise])
  tx = res[0]
  if (!tx || tx.block.toNumber() === 0) throw Error('Transaction not found')

  relayers = +res[1].toNumber()

  // const provider = getProvider(fromChain.slice(4) as ChainId)
  const currentBlock = await safeRead(_provider.getBlockNumber(), 0)
  if (currentBlock === 0 || tx.block.gt(currentBlock))
    throw Error(`Relayer ${relayerIndex} waiting for confirmations`)
  if (!tx.toChain.startsWith('evm.')) throw Error(`Relayer ${relayerIndex} bad contract params`)
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
    const relayersLength = relayers - 1
    const relayer1Url = process.env.RELAYER1_URL
    const relayer2Url = process.env.RELAYER2_URL
    for (let i = 1; i <= relayersLength; i++) {
      try {
        if (i === 1) {
          const res = await axios.get(geturl(relayer1Url, req.query))
          signatures = signatures.concat(res.data.signature)
        }
        if (i === 2) {
          const res = await axios.get(geturl(relayer2Url, req.query))
          signatures = signatures.concat(res.data.signature)
        }
      } catch (error: any) {
        console.log(error, 'dkdkdkdk')
        throw new Error(`relayer ${i + 1} error: ${error.message}`)
      }
    }
  }
  return signatures
  // } else {
  //   throw Error('bad contract params')
  // }
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
