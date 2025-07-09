import { ChainId } from "@/gotbit-tools/node/types"
import { IS_PROD } from '@/gotbit.config'
import {PublicKey} from '@solana/web3.js'

export const REAL_CHAIN_IDS: ChainId[] = IS_PROD
  ? ['97', '421614', '42421', '84532']
  : ['97', '421614', '42421', '84532']

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

export const SOLANABRIDGE_TOKENS= {
  '5Ff1K9UAT3RWqdZ24qcF3w3UNTvXWkfaqirQgWzgdsYb': "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
}