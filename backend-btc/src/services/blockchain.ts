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

export const getWalletEVM = () => new Wallet(process.env.PRIVATE_KEY!)

const getWallet = (signerIndex: number) => {
  if (signerIndex === 0) {
    console.log(process.env.PRIVATE_KEY, signerIndex, 'pk')
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
  console.log('sign hash', wallet, signerIndex)
  const domain = {
    name: EIP712DOMAIN_NAME,
    version: EIP712DOMAIN_VERSION,
    chainId,
    verifyingContract: contractAddress,
  }
  const types = {
    [eip712Transaction.name]: eip712Transaction.fields,
  }
  console.log('sign hash 2', domain)
  const sign = await wallet._signTypedData(domain, types, transaction)
  console.log('sign hash 3', sign)
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
  index: string
) => {
  let tx: TransactionContract
  console.log('helllo1')
  if (fromChain.startsWith('evm.')) {
    console.log('helllo2')
    const { bridgeAssist } = useContracts(undefined, fromChain.slice(4) as ChainId)
    console.log('helllo3', bridgeAssist)
    tx = await bridgeAssist(fromBridgeAddress).transactions(fromUser, index)
    console.log('helllo4', tx)
  } else {
    throw Error('bad arguments')
  }
  console.log('helllo5')
  const provider = getProvider(fromChain.slice(4) as ChainId)
  console.log('helllo6')
  const currentBlock = await safeRead(provider.getBlockNumber(), 0)
  console.log('helllo7', currentBlock)
  if (currentBlock === 0 || tx.block.gt(currentBlock))
    throw Error('waiting for confirmations')
  console.log('helllo8')
  if (tx.toChain.startsWith('evm.')) {
    console.log('helllo9')
    const chainId = tx.toChain.replace('evm.', '')
    console.log('helllo10', chainId)
    let signatures = []
    const signer0 = await signHashedTransaction(
      extractFulfillTransaction(tx),
      chainId,
      toBridgeAddress,
      0
    )
    console.log('helllo11', signer0)
    signatures.push(signer0)
    if (process.env.PRIVATE_KEY2){
      const signer1 = await signHashedTransaction(
        extractFulfillTransaction(tx),
        chainId,
        toBridgeAddress,
        1
      )
      signatures.push(signer1)
    }
    console.log('helllo12', signatures)
    return signatures
  } else {
    throw Error('bad contract params')
  }
}
