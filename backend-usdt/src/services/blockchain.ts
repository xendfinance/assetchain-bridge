import { Wallet, ethers, BigNumber, BigNumberish } from 'ethers'
import { useContracts, getProvider, safeRead, chainIds } from '@/gotbit-tools/node'
import { IS_PROD, config } from '@/gotbit.config'
import { ChainId } from '@/gotbit-tools/node/types'
import { TypedDataSigner } from '@ethersproject/abstract-signer'
import { GotbitKmsSigner } from '@/lib/kms-signer'
import CONFIRMATIONS from '../confirmations.json'

export const REAL_CHAIN_IDS: ChainId[] = ['97', '42421', '421614', '200810', '200901', '42420', '42161', '56', '8453', '84532', "1"]

const EIP712DOMAIN_NAME = 'BridgeAssist'
const EIP712DOMAIN_VERSION = '1.0'

const eip712Transaction = {
  name: 'FulfillTx',
  fields: [
    { name: 'amount', type: 'uint256' },
    { name: 'fromUser', type: 'string' },
    { name: 'toUser', type: 'address' },
    { name: 'fromChain', type: 'string' },
    { name: 'nonce', type: 'uint256' },
  ],
}

export const getWalletEVM = () => new Wallet(process.env.PRIVATE_KEY!)

const getWallet = (signerIndex: number) => {
  if (signerIndex === 0) {
    return new Wallet(process.env.PRIVATE_KEY, getProvider(config.DEFAULT_CHAINID))
  }
  return new Wallet(process.env.PRIVATE_KEY2!, getProvider(config.DEFAULT_CHAINID))
}
// : new GotbitKmsSigner(
//     process.env.GKMS_URL!,
//     process.env.GKMS_ACCESS_KEY!,
//     getProvider(config.DEFAULT_CHAINID)
//   )

type BridgeWithAddress = ReturnType<ReturnType<typeof useContracts>['bridgeAssist']>

type TransactionContract = Awaited<
  ReturnType<BridgeWithAddress['getUserTransactions']>
>[number]

type Transaction = {
  amount: string
  timestamp: string
  fromUser: string
  toUser: string // can be a solana address
  fromChain: string
  toChain: string
  nonce: string
}

type FulfillTxContract = {
  amount: BigNumberish
  fromChain: string
  nonce: BigNumberish
  fromUser: string
  toUser: string
}

type FulfillTx = {
  amount: string
  fromChain: string
  nonce: string
  fromUser: string
  toUser: string
}

type FulfillInfo = { txBlock: number; confirmations: number }

export type TransactionAndFulfilled = {
  transaction: Transaction
  fulfillTransaction: FulfillTx
  fulfilled: boolean
  claimInfo: FulfillInfo
}

export async function signHashedTransaction(
  transaction: FulfillTxContract,
  chainId: string,
  contractAddress: string,
  signerIndex: number
): Promise<string> {
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

  return wallet._signTypedData(domain, types, transaction)
}

const filterTxByBlock = (
  txs: TransactionContract[],
  chainId: ChainId,
  currentBlock: number
) => {
  return txs.filter(
    (tx) => currentBlock != 0 && tx.block.add(CONFIRMATIONS[chainId]).lt(currentBlock)
  )
}

export const getTransactions = async (user: string): Promise<TransactionContract[]> => {
  let transactions: TransactionContract[] = []
  for (const chainId of REAL_CHAIN_IDS) {
    const { bridgeAssist } = useContracts(undefined, chainId)
    const provider = getProvider(chainId)
    const currentBlock = await safeRead(provider.getBlockNumber(), 0)

    transactions = transactions.concat(
      // filterTxByBlock(
      await safeRead(bridgeAssist('0x2d808B8653aDEF4B4f2b7645a76Ac266890EFb88').getUserTransactions(user), [])
      // chainId,
      // currentBlock
      // )
    )
  }
  return transactions
}

export const packTx = (tx: TransactionContract) => {
  return ethers.utils.defaultAbiCoder.encode(
    ['uint', 'uint', 'address', 'string', 'string', 'string', 'uint'],
    [tx.amount, tx.timestamp, tx.fromUser, tx.toUser, tx.fromChain, tx.toChain, tx.nonce]
  )
}
export const hashTx = (tx: TransactionContract) => ethers.utils.keccak256(packTx(tx))

export const fulfilledInfo = async (
  tx: TransactionContract
): Promise<{
  isFulfilled: boolean
  txBlock: number
  confirmations: number
}> => {
  console.log(tx, 'zxc')
  const chainId = tx.toChain.replace('evm.', '') as ChainId
  const { bridgeAssist } = useContracts(undefined, chainId)
  console.log(chainId, bridgeAssist, 'zxc2')

  const fulfilledAt = await safeRead(
    bridgeAssist('0x2d808B8653aDEF4B4f2b7645a76Ac266890EFb88').fulfilledAt(tx.fromChain, tx.fromUser, tx.nonce),
    ethers.constants.Zero
  )

  console.log(fulfilledAt, 'AAAA')
  console.log(fulfilledAt.toNumber(), 'AAAA')

  // const provider = getProvider(chainId)
  return {
    isFulfilled: !fulfilledAt.eq(0),
    txBlock: tx.block.toNumber(),
    confirmations: CONFIRMATIONS[chainId],
  }
  // && fulfilledAt.add(CONFIRMATIONS[chainId]).lt(await provider.getBlockNumber())
}

export const pairTransactions = async (
  user: string
): Promise<
  [TransactionContract[], Record<string, boolean>, Record<string, FulfillInfo>]
> => {
  const fulfilled: Record<string, boolean> = {}
  const claimInfo: Record<string, FulfillInfo> = {}
  const transactions: TransactionContract[] = await getTransactions(user)
  const uniqueTransactions: TransactionContract[] = []
  console.log(transactions, fulfilled, claimInfo, 'TRANS')

  for (const transaction of transactions) {
    const hashedTx = hashTx(transaction)
    // if (!(hashedTx in fulfilled)) {
    //   uniqueTransactions.push(transaction)
    // }
    console.log('trans aaaaa', hashedTx)

    const fulfillInfo = await fulfilledInfo(transaction)
    console.log('trans bbbbb', hashedTx)

    fulfilled[hashedTx] = fulfillInfo.isFulfilled
    claimInfo[hashedTx] = {
      txBlock: fulfillInfo.txBlock,
      confirmations: fulfillInfo.confirmations,
    }
  }
  console.log('trans aaaaa')
  return [transactions, fulfilled, claimInfo]
}

export const extractTransaction = (tx: TransactionContract) => {
  return {
    amount: tx.amount.toString(),
    timestamp: tx.timestamp.toString(),
    fromUser: tx.fromUser,
    toUser: tx.toUser,
    fromChain: tx.fromChain.toString(),
    toChain: tx.toChain.toString(),
    nonce: tx.nonce.toString(),
  }
}

export const extractFulfillTransaction = (tx: TransactionContract) => {
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
    console.log(fromBridgeAddress, toBridgeAddress, fromChain.slice(4))
    const { bridgeAssist } = useContracts(undefined, fromChain.slice(4) as ChainId)
    tx = await bridgeAssist(fromBridgeAddress).transactions(fromUser, index)
    console.log(tx)
  } else {
    throw Error('bad arguments');
  }
  const provider = getProvider(fromChain.slice(4) as ChainId)
  const currentBlock = await safeRead(provider.getBlockNumber(), 0)
  if (
    currentBlock === 0 ||
    tx.block.add(CONFIRMATIONS[fromChain.slice(4) as ChainId]).gt(currentBlock)
  )
    throw Error('waiting for confirmations')
  if (tx.toChain.startsWith('evm.')) {
    const chainId = tx.toChain.replace('evm.', '')
    let signatures = []
    const signer0 = await signHashedTransaction(
      extractFulfillTransaction(tx),
      chainId,
      toBridgeAddress,
      0
    )
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
    return signatures
  } else {
    throw Error('bad contract params')
  }
}

export const getFulfilledTransactions = async (user: string) => {
  const [transactions, fulfilled, claimInfo] = await pairTransactions(user)
  const signedTransactions: TransactionAndFulfilled[] = []
  for (const transaction of transactions) {
    const hashedTx = hashTx(transaction)

    signedTransactions.push({
      transaction: extractTransaction(transaction),
      fulfillTransaction: extractFulfillTransaction(transaction),
      fulfilled: fulfilled[hashedTx],
      claimInfo: claimInfo[hashedTx],
    })
  }

  return signedTransactions
}
