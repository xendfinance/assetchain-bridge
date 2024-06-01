import { safeRead, safeWrite, useContracts, useWeb3 } from '@/gotbit-tools/vue'
import { defineContractStore } from '@/gotbit-tools/vue/store'

import { Symbol, getSignature, getTokenSignature } from '@/api/history'
import type { ChainId } from '@/gotbit-tools/vue/types'
import type { ContractTransaction } from 'ethers'
import { BigNumber, ethers } from 'ethers'

import type { FulfillTx, HistoryData } from '@/api/types'
import CONFIRMATIONS from '@/confirmations.json'
import {
  FulfillInfo,
  TransactionContract,
  extractFulfillTransaction,
  extractTransaction,
} from '@/misc/txUtils'
import { DEFAULT_NATIVE_TOKEN_CONTRACT_2, genPerChainId, getContract } from '@/misc/utils'
import { useFactory } from './factory'
import { computed } from 'vue'
import { useToken } from './token'
import { REAL_CHAIN_IDS } from '@/misc/chains'

export const packTx = (tx: TransactionContract) => {
  return ethers.utils.defaultAbiCoder.encode(
    ['uint', 'uint', 'address', 'string', 'string', 'string', 'uint'],
    [tx.amount, tx.timestamp, tx.fromUser, tx.toUser, tx.fromChain, tx.toChain, tx.nonce],
  )
}
export const hashTx = (tx: TransactionContract) => ethers.utils.keccak256(packTx(tx))

export interface IBridgeAssistState {
  histories: HistoryData[]
  emptyHistory: boolean
  loadingHistory: boolean
  limitPerSend: Record<ChainId, BigNumber>
  feeFulfill: Record<ChainId, BigNumber>
  feeSend: Record<ChainId, BigNumber>
  chainsList: string[]
  // bridgeAssist: Record<ChainId, string>
}
export interface IBridgeAssistActions {
  upload: () => Promise<void>
  send: (
    amount: BigNumber,
    to: ChainId,
    tokenAddress: string,
  ) => Promise<ContractTransaction | null>
  fulfill: (transaction: FulfillTx, index: number) => Promise<ContractTransaction | null>
  getTransactions: () => Promise<TransactionContract[]>
  pairTransactions: () => Promise<
    [TransactionContract[], Record<string, boolean>, Record<string, FulfillInfo>, string]
  >
  fulfilledInfo: (tx: TransactionContract) => Promise<{
    isFulfilled: boolean
    txBlock: number
    confirmations: number
  }>
  getUserTransactions: () => Promise<HistoryData[]>
}

export const useBridge = defineContractStore<IBridgeAssistState, IBridgeAssistActions>(
  'bridgeAssist',
  {
    state: () => ({
      loading: false,
      loadingHistory: false,
      emptyHistory: false,
      histories: [] as HistoryData[],
      limitPerSend: genPerChainId(() => ethers.constants.MaxUint256),
      feeFulfill: genPerChainId(() => BigNumber.from(0)),
      feeSend: genPerChainId(() => BigNumber.from(0)),
      chainsList: [],
      // bridgeAssist: genPerChainId(() => ''),
    }),
    actions: {
      async onInit() {
        this.loading = true

        for (const chainId of REAL_CHAIN_IDS as ChainId[]) {
          const contract = getContract(chainId)
          // this.bridgeAssist[chainId] = bridgeAssistAddress[chainId].bridgeAssist

          // const { bridgeAssist } = useContracts(undefined, chainId)

          // TODO get fees
          // this.feeFulfill[chainId] = await safeRead(
          //   contract.anyBridgeAssist(this.bridgeAssist[chainId]).feeFulfill(),
          //   this.feeFulfill[chainId],
          // )
          // this.feeSend[chainId] = await safeRead(
          //   contract.anyBridgeAssist(this.bridgeAssist[chainId]).feeSend(),
          //   this.feeSend[chainId],
          // )
        }

        this.loading = false
        return true
      },

      async onLogin() {
        // this.loading = true

        await this.upload()

        // this.loading = false
        return true
      },

      async upload() {
        const web3 = useWeb3()
        this.loadingHistory = true
        // this.histories = await getHistory(web3.wallet)
        this.histories = await this.getUserTransactions()

        this.loadingHistory = false

        this.emptyHistory = this.histories.length > 0 ? false : true
      },

      async send(amount, to, tokenAddress) {
        console.log(amount.formatNumber(18), 'send amount')
        const web3 = useWeb3()
        const factory = useFactory()
        // const { bridgeAssist } = useContracts(web3.signer!)
        const contract = getContract(web3.chainId)
        const bridgeAssistAddress =
          factory.assistAndTokenAddresses[web3.chainId].find(
            (item) => item.token === tokenAddress,
          )?.bridgeAssist ?? ''
        // contract.anyBridgeAssist('').connect(web3.signer!).send()
        this.loading = true
        const [tx] = await safeWrite(
          contract
            .anyBridgeAssist(bridgeAssistAddress)
            .connect(web3.signer!)
            .send(amount, web3.wallet, 'evm.' + to.toString()),
        )
        this.loading = false

        return tx
      },

      async fulfill(transaction, index) {
        const web3 = useWeb3()
        const factory = useFactory()
        // const { bridgeAssist } = useContracts(web3.signer!)
        const token = useToken()
        const contract = getContract(web3.chainId)
        console.log(
          transaction,
          'transaction',
          transaction.fromChain.slice(4),
          token.tokenAddress,
        )
        const fromBridgeAssistAddress = computed(
          () =>
            factory.assistAndTokenAddresses[
              transaction.fromChain.slice(4) as ChainId
            ].find((item) => item.token === token.tokenAddress)?.bridgeAssist ?? '',
        )

        const toBridgeAssistAddress = computed(
          () =>
            factory.assistAndTokenAddresses[web3.chainId].find(
              (item) =>
                item.token ===
                (token.symbol === 'RWA'
                  ? DEFAULT_NATIVE_TOKEN_CONTRACT_2
                  : token.tokenAddress),
            )?.bridgeAssist ?? '',
        )

        this.loading = true
        console.log(transaction.fromChain, transaction.fromUser, index)

        const signature = await getTokenSignature(
          token.symbol as Symbol,
          fromBridgeAssistAddress.value,
          toBridgeAssistAddress.value,
          transaction.fromChain,
          transaction.fromUser,
          index,
        )
        // console.log(signature, transaction)
        const [tx] = await safeWrite(
          contract
            .anyBridgeAssist(toBridgeAssistAddress.value)
            .connect(web3.signer!)
            .fulfill(transaction, [signature]),
        )

        console.log(transaction, [signature])
        console.log(tx?.data)

        this.loading = false

        return tx
      },

      async getTransactions(): Promise<TransactionContract[]> {
        let transactions: TransactionContract[] = []
        const web3 = useWeb3()
        const { supportedChains, assistAndTokenAddresses } = useFactory()

        const token = useToken()

        for (const chainId of supportedChains as ChainId[]) {
          // const { bridgeAssist } = useContracts(undefined, chainId)

          const bridgeAddress = assistAndTokenAddresses[chainId].find(
            (item) => item.token === token.tokenAddress,
          )?.bridgeAssist

          const contract = getContract(chainId)
          if (bridgeAddress) {
            transactions = transactions.concat(
              await safeRead(
                contract.anyBridgeAssist(bridgeAddress).getUserTransactions(web3.wallet),
                [],
              ),
            )
          }
        }
        console.log('dddddddddd', transactions)
        return transactions
      },

      async pairTransactions() {
        const { supportedChains, assistAndTokenAddresses } = useFactory()
        const token = useToken()

        const fulfilled: Record<string, boolean> = {}
        const claimInfo: Record<string, FulfillInfo> = {}
        const transactions: TransactionContract[] = await this.getTransactions()

        let symbol = ''

        for (const transaction of transactions) {
          const hashedTx = hashTx(transaction)
          const fromChain = transaction.fromChain.replace('evm.', '') as ChainId
          const bridgeAddress = assistAndTokenAddresses[fromChain].find(
            (item) => item.token === token.tokenAddress,
          )?.bridgeAssist
          const contract = getContract(fromChain)
          if (bridgeAddress) {
            const tokenAddress = await safeRead(
              contract.anyBridgeAssist(bridgeAddress).TOKEN(),
              '',
            )
            symbol = await safeRead(contract.anyToken(tokenAddress).symbol(), '')
          }

          const fulfillInfo = await this.fulfilledInfo(transaction)
          fulfilled[hashedTx] = fulfillInfo.isFulfilled
          claimInfo[hashedTx] = {
            txBlock: fulfillInfo.txBlock,
            confirmations: fulfillInfo.confirmations,
          }
        }

        return [transactions, fulfilled, claimInfo, symbol]
      },

      async fulfilledInfo(tx: TransactionContract) {
        const token = useToken()
        const chainId = tx.toChain.replace('evm.', '') as ChainId

        const { assistAndTokenAddresses } = useFactory()
        const bridgeAddress = assistAndTokenAddresses[chainId].find(
          (item) => item.token === token.tokenAddress,
        )?.bridgeAssist
        const contract = getContract(chainId)

        const fulfilledAt = await safeRead(
          contract
            .anyBridgeAssist(bridgeAddress!)
            .fulfilledAt(tx.fromChain, tx.fromUser, tx.nonce),
          ethers.constants.Zero,
        )

        return {
          isFulfilled: !fulfilledAt.eq(0),
          txBlock: tx.block.toNumber(),
          confirmations: CONFIRMATIONS[chainId],
        }
      },
      async getUserTransactions() {
        const [transactions, fulfilled, claimInfo, symbol] = await this.pairTransactions()
        const signedTransactions = []
        for (const transaction of transactions) {
          const hashedTx = hashTx(transaction)

          signedTransactions.push({
            transaction: extractTransaction(transaction),
            fulfillTransaction: extractFulfillTransaction(transaction),
            fulfilled: fulfilled[hashedTx],
            claimInfo: claimInfo[hashedTx],
            symbol,
          })
        }

        return signedTransactions.map((d) => ({
          ...d,
          transaction: {
            amount: d.transaction.amount,
            timestamp: Number(d.transaction.timestamp),
            fromUser: d.transaction.fromUser,
            toUser: d.transaction.toUser,
            fromChain: d.transaction.fromChain.replace('evm.', '') as ChainId,
            toChain: d.transaction.toChain.replace('evm.', '') as ChainId,
            nonce: Number(d.transaction.nonce),
            symbol: d.symbol,
          },
        }))
      },
    },
  },
)
