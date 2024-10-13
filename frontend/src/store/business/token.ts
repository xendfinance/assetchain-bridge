import { ChainId } from '@/gotbit-tools/vue/types'
import { useToken } from '@/store/contracts/token'
import { computed } from 'vue'

export const useTokenRead = () => {
  const token = useToken()

  return {
    balanceToken: (chainId: ChainId) => {
      return token.balances[chainId]?.formatString(token.decimals[chainId], 18) ?? '0'
    },
    balanceBridge: (chainId: ChainId) => {
      return (
        token.contractBalances[chainId]?.formatString(token.decimals[chainId], 18) ?? '0'
      )
    },
    balanceTokenNumber: (chainId: ChainId) => {
      return token.balances[chainId]?.formatNumber(token.decimals[chainId], 18) ?? 0
    },
    balanceNative: (chainId: ChainId) => {
      return token.balancesNative[chainId]?.formatNumber(token.decimals[chainId], 5) ?? 0
    },
    addresses: (chainId: ChainId) => computed(() => token.tokens[chainId]),
    allowance: (chainId: ChainId) => token.allowances[chainId],
    symbol: computed(() => token.symbol),
    getCurrentSymbol: (tokenAddres: string) => computed(() => token.cSymbol[tokenAddres]),
    decimals: computed(() => token.decimals),
    getCurrentDecimals: (tokenAddres: string) =>
      computed(() => token.cDecimals[tokenAddres]),
    tokens: computed(() => token.tokens),
    loading: computed(() => token.loading)
  }
}
