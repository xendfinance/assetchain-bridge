<template>
  <div class="page bg flex flex-col justify-between bg-primary-bg">
    <Header class="header" />
    <main class="py-20" id="start">
      <h1
        class="font-semibold text-[27px] md:text-[47px] mt-[24px] md:mt-[70px] text-center leading-[36px] md:leading-[64px] uppercase"
      >
        Cross-chain bridge
      </h1>
      <!-- <p class="text-center text-[16px] font-bold leading-[16px] mt-6">
        For LAUNCH tokens
      </p> -->

      <div class="w-full h-full flex flex-col items-center mt-8 px-5 md:px-0">
        <TokenSelect
          :options="options"
          v-model="token"
          class="max-w-[820px] w-full"
          bg="!bg-primary-card"
        />
        <BridgeCard :token-symbol="token" :tokens="tokensRead" />
        <BridgeHistory :token-symbol="token" v-if="login" />
      </div>
      <div class="mt-[48px] md:mt-[60px] flex flex-col items-center px-4">
        <h3 class="text-[26px] md:text-[32px] font-medium mb-3">FAQ</h3>
        <FaqCard
          v-for="card in faqCards"
          :key="card.title"
          :title="card.title"
          :text="card.text"
          class="max-w-[730px]"
        />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Footer from '@/components/nav/Footer.vue'
import Header from '@/components/nav/Header.vue'
import { computed, reactive, ref } from 'vue'

import FaqCard from '@/components/base/FaqCard.vue'
import BridgeCard from '@/components/bridge/BridgeCard.vue'
import TokenSelect from '@/components/bridge/TokenSelect.vue'
import BridgeHistory from '@/components/history/List.vue'

import { useWallet, useWeb3 } from '@/gotbit-tools/vue'
import { useTokenRead } from '@/store/business/token'
import { DEFAULT_NATIVE_TOKEN_CONTRACT_2 } from '@/misc/utils'
import { REAL_CHAIN_IDS } from '@/misc/chains'
import { useToken } from '@/store/contracts/token'

const { login } = useWallet()
const { tokens: tokensRead } = useTokenRead()

const faqCards = reactive([
  {
    title: 'What is a Bridge?',
    text: 'Bridge is a decentralized application for token transfer between blockchain networks. It allows a user to swap a cryptocurrency from one blockchain to another without the necessity of its selling.',
  },
  {
    title: 'How does a Bridge work?',
    text: 'A user has to make two transactions because transfer executes between two networks. Thus, the first transaction is sending of tokens to the smart contract of the first blockchain. After this, it is possible to get tokens from the smart contract of the second blockchain.',
  },
  {
    title: 'What functionality does Bridge have?',
    text: `- Connect a self-custody wallet (MetaMask, WalletConnect, OKX, MAD Wallet)  \n- Check on tokens balance- Get information about an amount of tokens that would be received after the transfer; \n- Transfer of tokens from one network to another and vice versa.`,
  },
])

const token = ref<string>('USDT')

const web3 = useWeb3()
const tokenStore = useToken()

const nativeToken = computed(() =>
  tokenStore.tokens[web3.chainId].filter(
    (t) => t.value === DEFAULT_NATIVE_TOKEN_CONTRACT_2,
  ),
)

const isNativeToken = computed(() =>
  nativeToken.value && nativeToken.value.length
    ? nativeToken.value[0].label === tokenStore.symbol
    : false,
)

const tokens = computed(() =>
  isNativeToken.value
    ? REAL_CHAIN_IDS.map((chain) => tokensRead.value[chain])
        .flat()
        .filter((t) => t.label !== 'RWA' || t.value === DEFAULT_NATIVE_TOKEN_CONTRACT_2)
    : REAL_CHAIN_IDS.map((chain) => tokensRead.value[chain])
        .flat()
        .filter((t) => t.value !== DEFAULT_NATIVE_TOKEN_CONTRACT_2),
)

const options = computed(() => [
  ...new Map(tokens.value.map((item) => [item.value, item])).values(),
])
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  position: relative;

  &::before {
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
  }

  .header {
    width: 100%;
    position: fixed;
  }
}
</style>
