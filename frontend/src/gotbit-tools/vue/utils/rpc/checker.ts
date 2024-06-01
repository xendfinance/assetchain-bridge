import type { ChainTag } from '../misc'

import { extraRpc } from '.'
import { getProvider, getChainTag } from '../info'

import { config } from '@/gotbit.config'

export const checkRpc = async (indexes?: Partial<Record<ChainTag, number>>) => {
  const chainIds = config.chainIds
  if (indexes === undefined) {
    for (const chainId of chainIds) {
      const provider = getProvider(chainId)
      try {
        await provider.getNetwork()
      } catch (e) {
        console.gotbit.error('RPC PROBLEM')
        config.rpc = extraRpc({})
        checkRpc({})
      }
    }
  } else {
    let errors = 0
    let reach = 0
    for (const chainId of chainIds) {
      const provider = getProvider(chainId)
      try {
        await provider.getNetwork()
      } catch (e) {
        errors++
        const chainTag = getChainTag(chainId)
        if (indexes[chainTag] === undefined) indexes[chainTag] = 1
        else {
          const a = indexes[chainTag]
          if (a !== undefined) indexes[chainTag] = a + 1
        }
        const rpc = extraRpc(indexes)
        if (rpc(chainTag) === '') {
          reach++
          const a = indexes[chainTag]
          if (a !== undefined) indexes[chainTag] = a - 1
        }
      }
      if (reach === chainIds.length) {
        console.always.error('Cant fix rpc')
        return
      }
    }
    if (errors === 0) {
      console.always.warn('Replace default rpc:')
      for (const chainId of chainIds)
        console.always.warn(chainId, ':', config.rpc(getChainTag(chainId)))
      return
    }

    config.rpc = extraRpc(indexes)
    checkRpc(indexes)
  }
}
