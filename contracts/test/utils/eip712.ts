import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumberish } from 'ethers'

export const EIP712DOMAIN_NAME = 'BridgeAssist'
export const EIP712DOMAIN_VERSION = '1.0'

export const eip712Transaction = {
  name: 'FulfillTx',
  fields: [
    { name: 'amount', type: 'uint256' },
    { name: 'fromUser', type: 'string' },
    { name: 'toUser', type: 'address' },
    { name: 'fromChain', type: 'string' },
    { name: 'nonce', type: 'uint256' },
  ],
}

export type Transaction = {
  amount: BigNumberish
  timestamp: BigNumberish
  fromChain: string
  toChain: string
  nonce: BigNumberish
  fromUser: string
  toUser: string
}

export type FulfillTx = {
  amount: BigNumberish
  fromChain: string
  nonce: BigNumberish
  fromUser: string
  toUser: string
}

export async function signHashedTransaction(
  signer: SignerWithAddress,
  transaction: FulfillTx,
  chainId: number,
  contractAddress: string
): Promise<string> {
  const domain = {
    name: EIP712DOMAIN_NAME,
    version: EIP712DOMAIN_VERSION,
    chainId,
    verifyingContract: contractAddress,
  }
  const types = {
    [eip712Transaction.name]: eip712Transaction.fields,
  }

  return signer._signTypedData(domain, types, transaction)
}
