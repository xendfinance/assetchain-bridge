import { BigNumber, ContractTransaction, ethers } from 'ethers'

import type {
  ChainId,
  IContractActions,
  IContractState,
  INotNullSigner,
} from '@/gotbit-tools/vue/types'

import { getProvider, safeRead, safeWrite, useWeb3 } from '@/gotbit-tools/vue'
import { defineContractStore } from '@/gotbit-tools/vue/store'
import { REAL_CHAIN_IDS } from '@/misc/chains'
import { DEFAULT_NATIVE_TOKEN_CONTRACT_2, genPerChainId, getContract } from '@/misc/utils'
import { useFactory } from './factory'

export interface ITokens {
  value: string
  label: string
  disabled: boolean
}

export interface ITokenState extends IContractState {
  balances: Record<ChainId, BigNumber>
  contractBalances: Record<ChainId, BigNumber>
  balancesNative: Record<ChainId, BigNumber>
  allowances: Record<ChainId, boolean>
  symbol: string
  cSymbol: Record<string, string>
  decimals: number
  cDecimals: Record<string, { [x: string]: number }>
  cAddresses: Record<string, { [x: string]: string }>
  tokens: Record<ChainId, ITokens[]>
}
export interface ITokenActions extends IContractActions {
  upload: () => Promise<void>
  hasAllowance: (
    owner: string,
    chainId: ChainId,
    amount: string,
    tokenAddress: string,
  ) => Promise<boolean>
  approveIf: (
    signer: INotNullSigner,
    amount: string,
    chainId: ChainId,
    tokenAddress: string,
  ) => Promise<ContractTransaction | null>
  reset: () => void
  getTokens: () => Promise<void>
  getBalances: () => Promise<void>
  setLoading: (loading: boolean) => void
  setToken: (symbol: string, tokenAddress: string) => Promise<void>
}

interface ITokenGetters {
  tokenAddress(state: ITokenState): string
}

export const useToken = defineContractStore<
  ITokenState,
  ITokenActions,
  { tokenAddress(state: ITokenState): string }
>('token', {
  state: () => ({
    loading: false,
    balances: genPerChainId(() => BigNumber.from(0)),
    balancesNative: genPerChainId(() => BigNumber.from(0)),
    allowances: genPerChainId(() => false),
    symbol: 'USDT',
    cSymbol: {},
    cDecimals: {},
    cAddresses: {},
    decimals: 6,
    tokens: genPerChainId(() => []),
    contractBalances: genPerChainId(() => BigNumber.from(0)),
  }),
  getters: {
    tokenAddress(state) {
      let address = ''
      Object.keys(state.cSymbol).forEach((k) => {
        if (state.cSymbol[k] === state.symbol) address = k
      })
      return address
    },
  },
  actions: {
    async onInit() {
      const factory = useFactory()
      this.loading = true

      await this.upload()
      await factory.upload()
      await factory.getSupportedChains()

      this.loading = false
      return true
    },
    async onLogin() {
      const web3 = useWeb3()
      if (!REAL_CHAIN_IDS.includes(web3.realChainId?.toString() as ChainId)) {
        await web3.switchChain(web3.DEFAULT_CHAINID)
      }
      // await this.getTokens()
      await this.getBalances()
      return true
    },

    async upload() {
      const web3 = useWeb3()
      this.loading = true
      await this.getTokens()
      if (web3.login) {
        console.log('upload token balances')
        await this.getBalances()
      }
      this.loading = false
    },

    async reset() {
      for (const chainId of REAL_CHAIN_IDS) {
        this.balances[chainId] = ethers.constants.Zero
      }
      this.contractBalances = this.balances
    },

    async getBalances() {
      console.log('getBalances')
      const web3 = useWeb3()

      this.loading = true
      if (this.tokenAddress)
        for (const chainId of REAL_CHAIN_IDS) {
          // const { token } = useContracts(undefined, chainId)
          const contract = getContract(chainId)

          if (this.tokenAddress === DEFAULT_NATIVE_TOKEN_CONTRACT_2) {
            const provider = getProvider(chainId)
            this.balances[chainId] = await provider.getBalance(web3.wallet)
          } else
            this.balances[chainId] = await safeRead(
              contract.anyToken(this.tokenAddress).balanceOf(web3.wallet),
              '0'.toBigNumber(),
            )
        }

      this.loading = false
    },

    async getTokens() {
      const factory = useFactory()
      await factory.upload()

      for (const chainId of REAL_CHAIN_IDS) {
        this.tokens[chainId] = []
        const contract = getContract(chainId)
        factory.assistAndTokenAddresses[chainId]?.map(async (item) => {
          console.log(item.token, 'TOKEN')
          if (item.token) {
            let symbol = 'RWA'
            let decimals = 6

            if (item.token === DEFAULT_NATIVE_TOKEN_CONTRACT_2) {
              symbol = 'RWA'
              decimals = 18
            } else {
              symbol = await safeRead(contract.anyToken(item.token).symbol(), 'RWA')
              decimals = await safeRead(contract.anyToken(item.token).decimals(), 6)
            }

            this.cSymbol[item.token] = symbol

            this.cDecimals[chainId] = {
              ...this.cDecimals[chainId],
              ...{ [symbol]: decimals },
            }
            this.cAddresses[chainId] = {
              ...this.cAddresses[chainId],
              ...{ [symbol]: item.token },
            }
            // this.tDecimals[chainId] = decimals

            const foundToken = this.tokens[chainId].filter((t) => t.label === symbol)

            if (!foundToken.length)
              this.tokens[chainId].push({
                value: item.token,
                label: symbol,
                disabled: false,
              })
          }
        })
        console.log('this.tokens', chainId, factory.assistAndTokenAddresses[chainId])
      }
    },
    async setToken(symbol, tokenAddress) {
      const web3 = useWeb3()
      const factory = useFactory()
      console.log(tokenAddress)
      let chainId: ChainId = web3.chainId as ChainId
      if (
        !factory.assistAndTokenAddresses[chainId].find((a) => a.token === tokenAddress)
      ) {
        for (const c of REAL_CHAIN_IDS) {
          if (factory.assistAndTokenAddresses[c].find((a) => a.token === tokenAddress)) {
            chainId = c
            console.log(chainId, 'setToken')
            break
          }
        }
      }

      const contract = getContract(chainId as ChainId)
      if (tokenAddress === DEFAULT_NATIVE_TOKEN_CONTRACT_2) {
        this.symbol = 'RWA'
        this.decimals = 18
      } else {
        const dataSymbol = await safeRead(contract.anyToken(tokenAddress).symbol(), 'RWA')
        const dataDecimals = await safeRead(
          contract.anyToken(tokenAddress).decimals(),
          18,
        )

        this.symbol = dataSymbol
        this.decimals = dataDecimals
      }
    },

    async approveIf(signer, amount, chainId, tokenAddress) {
      const web3 = useWeb3()
      const factory = useFactory()
      // const { token } = useContracts(signer, chainId)
      const contract = getContract(chainId)

      const bridgeAssistAddress =
        factory.assistAndTokenAddresses[chainId]?.find(
          (item) => item.token === tokenAddress,
        )?.bridgeAssist ?? ''
      console.log('approveIf BridgeAssist', {
        bridgeAssistAddress,
        decimals: this.decimals,
      })
      this.loading = true
      const [tx] = await safeWrite(
        contract
          .anyToken(tokenAddress)
          .connect(signer)
          .approve(
            bridgeAssistAddress,
            amount.toBigNumber(this.cDecimals[web3.chainId][this.symbol]),
          ),
      )
      if (tx) this.hasAllowance(web3.wallet, web3.chainId, amount, tokenAddress)
      this.loading = false
      return tx
    },

    async hasAllowance(owner, chainId, amount, tokenAddress) {
      console.log(owner, chainId, amount, tokenAddress, 'AAAAA')
      const factory = useFactory()
      const bridgeAssist = factory.assistAndTokenAddresses[chainId]?.find(
        (item) => item.token === tokenAddress,
      )?.bridgeAssist
      // const { token } = useContracts(undefined, chainId)
      const contract = getContract(chainId)
      const allowance = await safeRead(
        contract.anyToken(tokenAddress).allowance(owner, bridgeAssist ?? ''),
        BigNumber.from(0),
      )

      if (allowance.gte(amount.toBigNumber(this.decimals))) {
        this.allowances[chainId] = true
        return true
      }

      this.allowances[chainId] = false
      return false
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },
  },
})
