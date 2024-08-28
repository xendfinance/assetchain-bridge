import { mapContractSafe, safeRead } from '@/gotbit-tools/vue'
import { defineContractStore } from '@/gotbit-tools/vue/store'

import type { ChainId, ContractActions } from '@/gotbit-tools/vue/types'
import { config } from '@/gotbit.config'
import { REAL_CHAIN_IDS } from '@/misc/chains'
import { BigNumber, ethers } from 'ethers'
import { getContract } from '@/misc/utils'
import { useToken } from './token'

export interface BridgeFact {
  token: string
  bridgeAssist: string
}

export interface ISupportedChains {
  tokenAddress: string
  chains: string[]
}
export interface IBridgeAssistState {
  loading: boolean
  // bridgeAssistAddress: Record<ChainId, BridgeFact>
  bridgeAddresses: Record<ChainId, string>
  assistAndTokenAddresses: Record<ChainId, BridgeFact[]>
  bridgesLength: Record<ChainId, BigNumber>
  supportedChains: string[]
}

export interface BridgeAssistActions {
  setBridgeAssistAndToken: (chainId: ChainId, tokenAddress: string) => void
  upload: () => Promise<void>
  getSupportedChains: () => Promise<void>
}

const genPerChainId = <T>(content: () => T) => {
  const ans: Record<string, T> = {}
  for (const chainId of config.chainIds) {
    ans[chainId] = content()
  }
  return ans
}

export const useFactory = defineContractStore<
  IBridgeAssistState,
  BridgeAssistActions & ContractActions<'bridgeFactory'>
>('bridgeFactory', {
  state: () => ({
    loading: false,
    // bridgeAssistAddress: genPerChainId(() => ({ token: '', bridgeAssist: '' })),
    assistAndTokenAddresses: genPerChainId(() => [{ token: '', bridgeAssist: '' }]),
    bridgeAddresses: genPerChainId(() => ''),
    bridgesLength: genPerChainId(() => BigNumber.from(0)),
    supportedChains: [],
  }),
  actions: {
    ...mapContractSafe('bridgeFactory'),
    async onInit() {
      this.loading = true
      // await this.upload()
      // await this.getSupportedChains()
      this.loading = false
      return true
    },

    async upload() {
      for (const chainId of REAL_CHAIN_IDS) {
        const contract = getContract(chainId)
        const assistsLength = await contract.bridgeFactory.getCreatedBridgesLength()
        this.bridgesLength[chainId] = assistsLength
        if (assistsLength.toNumber()) {
          const assists = await contract.bridgeFactory.getCreatedBridgesInfo(
            0,
            assistsLength
          )

          // console.log(assists, 'assists getCreatedBridgesInfo for ', chainId)
          // console.log(
          //   Object.values(assists).map((v) => ({
          //     bridgeAssist: v.bridgeAssist,
          //     token: v.token,
          //   })),
          //   'keys'
          // )

          this.assistAndTokenAddresses[chainId] = assists
          // this.bridgeAssistAddress[chainId] = assists[0]
        }
      }
    },

    async getSupportedChains() {
      this.loading = true

      const token = useToken()

      const chainIds = token.symbol === 'USDC' ? REAL_CHAIN_IDS.filter(c => c !== '421614') : REAL_CHAIN_IDS

      const res = await Promise.all(
        chainIds.map(async (id) => {
          const _token = token.tokens[id].find( t => t.label === token.symbol)
          if (!_token) return 
          const bridgeAddress = this.assistAndTokenAddresses[id].find(
            (item) => item.token === _token.value
          )?.bridgeAssist

          if (bridgeAddress) {
            const contract = getContract(id)
            const listBytes = await safeRead(
              contract.anyBridgeAssist(bridgeAddress).supportedChainList(),
              []
            )
            return [...listBytes, ethers.utils.formatBytes32String(`evm.${id}`)]
          }
        })
      )
      const defaultChainsList =
        res
          .flat()
          .map((chainBytes) =>
            chainBytes ? ethers.utils.parseBytes32String(chainBytes) : ''
          ) ?? []

      const normalizedChainsList = defaultChainsList
        .filter((el) => !!el)
        .map((el) => el.split('.')[1])
      this.supportedChains = [...new Set(normalizedChainsList)]
      this.loading = false
    },

    setBridgeAssistAndToken(chainId, tokenAddress) {
      const newBridge = this.assistAndTokenAddresses[chainId].find(
        (item) => item.token === tokenAddress
      )
      // this.bridgeAssistAddress[chainId] = newBridge ?? this.bridgeAssistAddress[chainId]
    },
  },
})
