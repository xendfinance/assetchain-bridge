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
  decimals: Record<ChainId, number>
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
    tokenAddress: string
  ) => Promise<boolean>
  approveIf: (
    signer: INotNullSigner,
    amount: string,
    chainId: ChainId,
    tokenAddress: string
  ) => Promise<ContractTransaction | null>
  reset: () => void
  getTokens: () => Promise<void>
  getBalances: () => Promise<void>
  setLoading: (loading: boolean) => void
  setToken: (symbol: string, tokenAddress: string) => Promise<void>
  // setDecimals: (tokenAddress: string) => Promise<void>
  setDecimals: (tokenAddress: string) => Promise<void>
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
    decimals: {
      '97': 18,
      '421614': 6,
      '42421': 6,
      '80002': 6,
      '84532': 6,
      '11155111': 6,
      '200810': 6,
      '200901': 6,
      '42161': 6,
      '42420': 6,
      '56': 18,
      '8453': 6,
      '1': 6
    },
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
        // console.log('upload token balances')
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
      // console.log('getBalances', this.symbol)
      const web3 = useWeb3()

      this.loading = true
      if (this.tokenAddress)
        await Promise.all(
          REAL_CHAIN_IDS.map(async (chainId) => {
            const contract = getContract(chainId)
            const factory = useFactory()
            const tokenAddr =
              (this.symbol === 'RWA' && chainId === '42421') || (this.symbol === 'RWA' && chainId === '42420') ||
              (this.symbol === 'BTC' && chainId === '200810') || (this.symbol === 'BTC' && chainId === '200901')
                ? DEFAULT_NATIVE_TOKEN_CONTRACT_2
                : this.tokenAddress
            const bridgeAssistAddress =
              factory.assistAndTokenAddresses[chainId]?.find(
                (item) => item.token === tokenAddr
              )?.bridgeAssist ?? ''
            if (
              (this.symbol === 'RWA' && chainId === '42421') || (this.symbol === 'RWA' && chainId === '42420') ||
              (this.symbol === 'BTC' && chainId === '200810') || (this.symbol === 'BTC' && chainId === '200901')
            ) {
              const provider = getProvider(chainId)
              this.balances[chainId] = await provider.getBalance(web3.wallet)
              this.contractBalances[chainId] = await provider.getBalance(
                bridgeAssistAddress
              )
            } else {
              const token = this.tokens[chainId].find((t) => t.label === this.symbol)
              if (!token) {
                this.balances[chainId] = BigNumber.from(0)
                this.contractBalances[chainId] = BigNumber.from(0)
              } else {
                this.balances[chainId] = await safeRead(
                  contract.anyToken(token.value).balanceOf(web3.wallet),
                  '0'.toBigNumber()
                )
                if (bridgeAssistAddress) {
                  this.contractBalances[chainId] = await safeRead(
                    contract.anyToken(token.value).balanceOf(bridgeAssistAddress),
                    '0'.toBigNumber()
                  )
                }
              }
            }
          })
        )

      // console.log(this.balances, 'lkkj')
      this.loading = false
    },

    async getTokens() {
      const factory = useFactory()
      await factory.upload()

      const tokenPromises = REAL_CHAIN_IDS.map(async (chainId) => {
        this.tokens[chainId] = []
        const contract = getContract(chainId)
        const assists = factory.assistAndTokenAddresses[chainId]

        const chainPromises = assists.map(async (item) => {
          if (item.token) {
            let symbol = 'RWA'
            let decimals = 6

            // Handle native tokens
            if (item.token === DEFAULT_NATIVE_TOKEN_CONTRACT_2) {
              if (chainId === '42421' || chainId === '42420') {
                symbol = 'RWA'
                decimals = 18
              } else {
                symbol = 'BTC'
                decimals = 18
              }
            } else {
              // Fetch symbol and decimals for non-native tokens
              const _symbol = await safeRead(contract.anyToken(item.token).symbol(), 'RWA')
              symbol = _symbol === 'USD₮0' ? "USDT" : _symbol
              decimals = await safeRead(contract.anyToken(item.token).decimals(), 6)
            }

            // Update token info (symbol and decimals)
            this.cSymbol[item.token] = symbol
            this.cDecimals[chainId] = {
              ...this.cDecimals[chainId],
              [symbol]: decimals,
            }
            this.cAddresses[chainId] = {
              ...this.cAddresses[chainId],
              [symbol]: item.token,
            }

            // Add token if it's not already in the list for the current chain
            const foundToken = this.tokens[chainId].find((t) => t.label === symbol)
            if (!foundToken) {
              if (symbol === `RWA` && chainId === '42420') return
              this.tokens[chainId].push({
                value: item.token,
                label: symbol,
                disabled: false,
              })
            }
          }
        })

        // Wait for all tokens to be processed for the current chain
        await Promise.all(chainPromises)
      })

      // Wait for all chains to finish processing
      await Promise.all(tokenPromises)

      // Optional: log final tokens structure
      console.log('this.tokens', this.tokens);
    },

    async setToken(symbol, tokenAddress) {
      console.log(symbol, tokenAddress, 'dhsjk')
      const web3 = useWeb3()
      const factory = useFactory()
      this.loading = true
      let chainId: ChainId = web3.chainId as ChainId
      if (
        !factory.assistAndTokenAddresses[chainId].find((a) => a.token === tokenAddress)
      ) {
        for (const c of REAL_CHAIN_IDS) {
          if (factory.assistAndTokenAddresses[c].find((a) => a.token === tokenAddress)) {
            chainId = c
            // console.log(chainId, 'setToken')
            break
          }
        }
      }

      const contract = getContract(chainId as ChainId)
      if (tokenAddress === DEFAULT_NATIVE_TOKEN_CONTRACT_2) {
        if (chainId === '42421' || chainId === '42420') {
          this.symbol = 'RWA'
        } else {
          this.symbol = 'BTC'
        }

        this.decimals[chainId] = 18
      } else {
        const dataSymbol = await safeRead(contract.anyToken(tokenAddress).symbol(), 'RWA')
        this.symbol = dataSymbol === 'USD₮0' ? 'USDT' : dataSymbol
        // console.log(dataSymbol, 'symbol')
        await this.setDecimals(this.symbol)
      }
      await this.getBalances()
    },

    // async setDecimals(tokenAddress: string, symbol: string) {
    //   for (const chainID of REAL_CHAIN_IDS) {
    //     const _contract = getContract(chainID as ChainId)
    //     const token = this.tokens[chainID].find(t => t.label)
    //     const dataDecimals = await safeRead(
    //       _contract.anyToken(tokenAddress).decimals(),
    //       18
    //     )
    //     this.decimals[chainID] = dataDecimals
    //   }
    // },
    async setDecimals(symbol: string) {
      await Promise.all(
        REAL_CHAIN_IDS.map(async (chainID) => {
          const _contract = getContract(chainID as ChainId)
          const token = this.tokens[chainID].find((t) => t.label === symbol)
          if (!token) {
            this.decimals[chainID] = 18
          } else {
            if (token.value === DEFAULT_NATIVE_TOKEN_CONTRACT_2) {
              this.decimals[chainID] = 18
            } else {
              const dataDecimals = await safeRead(
                _contract.anyToken(token.value).decimals(),
                18
              )
              this.decimals[chainID] = dataDecimals
            }
          }
        })
      )
    },

    async approveIf(signer, amount, chainId, tokenAddress) {
      const web3 = useWeb3()
      const factory = useFactory()
      // const { token } = useContracts(signer, chainId)
      const contract = getContract(chainId)

      const bridgeAssistAddress =
        factory.assistAndTokenAddresses[chainId]?.find(
          (item) => item.token === tokenAddress
        )?.bridgeAssist ?? ''
      // console.log('approveIf BridgeAssist', {
      //   bridgeAssistAddress,
      //   decimals: this.decimals,
      // })
      this.loading = true
      const [tx] = await safeWrite(
        contract
          .anyToken(tokenAddress)
          .connect(signer)
          .approve(
            bridgeAssistAddress,
            amount.toBigNumber(this.cDecimals[web3.chainId][this.symbol])
          )
      )
      if (tx) this.hasAllowance(web3.wallet, web3.chainId, amount, tokenAddress)
      this.loading = false
      return tx
    },

    async hasAllowance(owner, chainId, amount, tokenAddress) {
      if (tokenAddress === DEFAULT_NATIVE_TOKEN_CONTRACT_2) return true
      const factory = useFactory()
      const _token = this.tokens[chainId].find((t) => t.label === this.symbol)
      const bridgeAssist = factory.assistAndTokenAddresses[chainId]?.find(
        (item) => item.token === _token?.value
      )?.bridgeAssist
      // const { token } = useContracts(undefined, chainId)

      const contract = getContract(chainId)
      const allowance = await safeRead(
        contract.anyToken(_token?.value!).allowance(owner, bridgeAssist ?? ''),
        BigNumber.from(0)
      )

      if (allowance.gte(amount.toBigNumber(this.decimals[chainId]))) {
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
