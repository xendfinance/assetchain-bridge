import type { HistoryData, HistoryRawData } from '@/api/types'
import { safe } from '@/gotbit-tools/vue'
import { ChainId } from '@/gotbit-tools/vue/types'
import { IS_DEBUG } from '@/gotbit.config'

import axios from 'axios'

const baseURL = import.meta.env.VITE_BACKEND_LINK
// const baseURL = 'http://localhost:3000'

export type Symbol = 'USDT' | 'USDC' | 'RWA' | 'WETH' | 'WNT' | 'aUSDC.e' | 'BTC' | 'WBTC'

const getUrl = (symbol: Symbol) => {
  if (!IS_DEBUG){
    return import.meta.env.VITE_BACKEND_LINK
  }
  else {
    if (symbol === 'RWA') return import.meta.env.VITE_BACKEND_LINK_RWA
    else return import.meta.env.VITE_BACKEND_LINK
  }
  // switch (symbol) {
  //   case 'RWA':
  //     return import.meta.env.VITE_BACKEND_LINK_RWA
  //   case 'USDT':
  //     return import.meta.env.VITE_BACKEND_LINK_USDT
  //   case 'USDC':
  //     return import.meta.env.VITE_BACKEND_LINK_USDC
  //   case 'WETH':
  //     return import.meta.env.VITE_BACKEND_LINK_WETH
  //   case 'WNT':
  //     return import.meta.env.VITE_BACKEND_LINK_WNT
  //   case 'aUSDC.e':
  //     return import.meta.env.VITE_BACKEND_LINK_AUSDCE
  //   case 'BTC':
  //     return import.meta.env.VITE_BACKEND_LINK_BTC
  //   case 'WBTC':
  //     return import.meta.env.VITE_BACKEND_LINK_WBTC
  //   default:
  //     return import.meta.env.VITE_BACKEND_LINK_USDT
  // }
}

const axiosClientToken = (token: Symbol) => {
  return axios.create({
    baseURL: getUrl(token),
    transformResponse: [
      (data) => {
        return JSON.parse(data)
      },
    ],
  })
}

const axiosClient = axios.create({
  baseURL,
  transformResponse: [
    (data) => {
      return JSON.parse(data)
    },
  ],
})

const TRANSACTIONS = '/transactions'
const SIGN = '/sign'

// export async function getHistory(user: string): Promise<HistoryData[]> {
//   const [response, error] = await safe(
//     axiosClient.get<HistoryRawData[]>(TRANSACTIONS, { params: { user } }),
//   )
//   console.log(response, 1111)
//   const resWithChainIds: HistoryData[] | undefined = response?.data.map((d) => {
//     return {
//       ...d,
//       transaction: {
//         amount: d.transaction.amount,
//         timestamp: d.transaction.timestamp,
//         fromUser: d.transaction.fromUser,
//         toUser: d.transaction.toUser,
//         fromChain: d.transaction.fromChain.replace('evm.', '') as ChainId,
//         toChain: d.transaction.toChain.replace('evm.', '') as ChainId,
//         nonce: d.transaction.nonce,
//       },
//     }
//   })

//   if (resWithChainIds) return resWithChainIds
//   return []
// }

export async function getTokenSignature(
  symbol: Symbol,
  fromBridgeAddress: string,
  toBridgeAssistAddress: string,
  fromChain: string,
  fromUser: string,
  index: number
): Promise<string | string[]> {
  const [response, error] = await safe(
    axiosClientToken(symbol).get<{ signature: string | string[] }>(SIGN, {
      params: { fromBridgeAddress, toBridgeAssistAddress, fromChain, fromUser, index },
    })
  )

  if (response) return response.data.signature
  return ''
}

export async function getSignature(
  fromBridgeAddress: string,
  toBridgeAssistAddress: string,
  fromChain: string,
  fromUser: string,
  index: number
): Promise<string> {
  const [response, error] = await safe(
    axiosClient.get<{ signature: string }>(SIGN, {
      params: { fromBridgeAddress, toBridgeAssistAddress, fromChain, fromUser, index },
    })
  )

  if (response) return response.data.signature
  return ''
}
