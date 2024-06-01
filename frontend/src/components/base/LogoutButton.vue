<template>
  <div class="flex gap-4">
    <div
      class="w-[36px] h-[36px] rounded-full bg-primary-text flex items-center justify-center"
      :class="{
        'bg-black': web3.walletType === 'okxwallet',
        'bg-white': web3.walletType === 'walletconnect',
      }"
    >
      <MetamaskIcon v-if="web3.walletType === 'metamask'" size="24px" />
      <WalletConnectIcon v-if="web3.walletType === 'walletconnect'" size="24px" />
      <CoinbaseIcon v-if="web3.walletType === 'coinbase'" size="24px" />
      <TrustWalletIcon v-if="web3.walletType === 'trustwallet'" size="24px" />
      <OKXWalletIcon v-if="web3.walletType === 'okxwallet'" size="24px" />
    </div>
    <div class="flex flex-col items-start">
      <span class="text-[15px] leading-[18px]">
        {{ wallet.shortAddress(12, 5) }}
      </span>
      <button @click="disconnect" class="px-0">
        <span class="text-[14px] text-primary-btn">Log out</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useWallet } from '@/gotbit-tools/vue'
import { useWeb3 } from '@/gotbit-tools/vue'
import MetamaskIcon from '@/components/base/icons/MetamaskIcon.vue'
import WalletConnectIcon from '@/components/base/icons/WalletConnectIcon.vue'
import CoinbaseIcon from '@/components/gotbit-ui-kit/icons/CoinbaseIcon.vue'
import TrustWalletIcon from '@/components/gotbit-ui-kit/icons/TrustWalletIcon.vue'
import OKXWalletIcon from '@/components/gotbit-ui-kit/icons/OKXWalletIcon.vue'

const web3 = useWeb3()

const { walletLabel, disconnect, wallet } = useWallet()
</script>
