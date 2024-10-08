import { Wallet, ethers, BigNumber, BigNumberish } from 'ethers'
import { useContracts, getProvider, safeRead } from '@/gotbit-tools/node'
import { config } from '@/gotbit.config'
import { ChainId } from '@/gotbit-tools/node/types'
import CONFIRMATIONS from '../confirmations.json'
import { FulfillTxContract, TransactionContract } from '@/types'
import { EIP712DOMAIN_NAME, EIP712DOMAIN_VERSION, eip712Transaction } from '@/utils/constant'



export const getWalletEVM = () => new Wallet(process.env.PRIVATE_KEY!)

const getWallet = () => {
  return process.env.DEBUG
    ? new Wallet(process.env.PRIVATE_KEY, getProvider(config.DEFAULT_CHAINID))
    : new Wallet(process.env.PRIVATE_KEY, getProvider(config.DEFAULT_CHAINID))
}


async function signHashedTransaction(
  transaction: FulfillTxContract,
  chainId: string,
  contractAddress: string
) {
  const wallet = getWallet()
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
  index: string
) => {
  let tx: TransactionContract
  if (fromChain.startsWith('evm.')) {
    const { bridgeAssist } = useContracts(undefined, fromChain.slice(4) as ChainId)
    tx = await bridgeAssist(fromBridgeAddress).transactions(fromUser, index)
  } else {
    throw Error('bad arguments')
  }
  const provider = getProvider(fromChain.slice(4) as ChainId)
  const currentBlock = await safeRead(provider.getBlockNumber(), 0)
  if (
    currentBlock === 0 ||
    tx.block.gt(currentBlock)
  )
    throw Error('waiting for confirmations')
  if (tx.toChain.startsWith('evm.')) {
    const chainId = tx.toChain.replace('evm.', '')
    const { bridgeAssist } = useContracts(undefined, chainId as ChainId)
    return await signHashedTransaction(
      extractFulfillTransaction(tx),
      chainId,
      bridgeAssist(toBridgeAddress).address
    )
  } else {
    throw Error('bad contract params')
  }
}
