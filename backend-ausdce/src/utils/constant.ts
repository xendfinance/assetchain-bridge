import { ChainId } from "@/gotbit-tools/node/types"
import { IS_PROD } from '@/gotbit.config'

export const REAL_CHAIN_IDS: ChainId[] = IS_PROD
  ? ['97', '421614', '42421']
  : ['97', '421614', '42421']

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