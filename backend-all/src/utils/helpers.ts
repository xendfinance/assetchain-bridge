import { ChainId, ChainTag } from '@/gotbit-tools/node/types'
import {
  arbitrum_mainnet_rpc,
  arbitrum_sepolia_rpc,
  base_mainnet_rpc,
  base_spolia_rpc,
  binance_mainnet_rpc,
  binance_testnet_rpc,
  ethereum_mainnet_rpc,
  ethereum_sepolia_rpc,
  polygon_amoy_rpc,
  polygon_mainnet_rpc,
  relayerIndex,
} from './env-var'
import { providers } from 'ethers'
import { universalRpc } from '@/gotbit-tools/node/rpc'
import { getChainName, getChainTag } from '@/gotbit-tools/node'

export async function getActiveRpc(rpcList: string[], timeoutMs: number = 5000) {
  /**
   * Check a list of RPC endpoints and return the first active one.
   *
   * @param rpcList - Array of RPC URLs to check
   * @param timeoutMs - Timeout in milliseconds for each request
   * @returns The first active RPC URL found, or null if none are active
   */

  // Create AbortController for timeout functionality
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  let index = 1
  for (const rpc of rpcList) {
    try {
      // First try Ethereum-style JSON-RPC call
      const jsonRpcResponse = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
        signal: controller.signal,
      })

      if (jsonRpcResponse.ok) {
        const data = await jsonRpcResponse.json()
        if (data.result) {
          console.log(`Choose index ${index} rpc`)
          clearTimeout(timeout)
          return rpc
        }
      }

      // If JSON-RPC didn't work, try simple GET request
    //   const getResponse = await fetch(rpc, {
    //     signal: controller.signal,
    //   })

    //   if (getResponse.ok) {
    //     clearTimeout(timeout)
    //     console.log(`Choose index ${index} rpc`)
    //     return rpc
    //   }
    } catch (error) {
      // Continue to next RPC if this one fails
      continue
    } finally {
      clearTimeout(timeout)
      index++
    }
  }

  return null
}

export function getChainRPCS(chainId: ChainId) {
  switch (chainId) {
    case '42161':
      return arbitrum_mainnet_rpc
    case '421614':
      return arbitrum_sepolia_rpc
    case '8453':
      return base_mainnet_rpc
    case '84532':
      return base_spolia_rpc
    case '56':
      return binance_mainnet_rpc
    case '97':
      return binance_testnet_rpc
    case '1':
      return ethereum_mainnet_rpc
    case '137':
        return polygon_mainnet_rpc
    case '80002':
        return polygon_amoy_rpc
    default:
      return undefined
  }
}

const _rpc = universalRpc()

export async function _getProvider(chainId: ChainId) {
  let rpc: string | null = ''
  const rpcListString = getChainRPCS(chainId)
  console.log(rpcListString,'list', chainId)
  if (rpcListString) {
    const rpcList = rpcListString.split(',')
    rpc = await getActiveRpc(rpcList)
    if (rpc) {
      console.log(`Using RPC private RPC`)
    }
  } else {
    rpc = _rpc(getChainTag(chainId))
    console.log(rpc, chainId, 'kdkdk')
    if (!rpc) throw new Error(`Relayer ${relayerIndex} Rpc error on ${chainId}. Please try again later`)
    rpc = await getActiveRpc([rpc])
    console.log(`Using RPC public RPC`)
  }
  if (!rpc) throw new Error(`Relayer ${relayerIndex} Rpc error on ${chainId}. Please try again later`)
  return new providers.JsonRpcProvider(rpc)
}
