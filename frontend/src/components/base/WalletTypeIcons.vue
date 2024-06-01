<template>
  <div>
    <MetamaskIcon v-if="web3.walletType === 'metamask'" size="18px" />
    <WalletConnectIcon v-if="web3.walletType === 'walletconnect'" size="18px" />
    <CoinbaseIcon v-if="web3.walletType === 'coinbase'" size="18x" class="w-[24px]"/>
    <TrustWalletIcon v-if="web3.walletType === 'trustwallet'" size="18px" />
    <OKXWalletIcon v-if="web3.walletType === 'okxwallet'" size="18px" />
  </div>
</template>

<script lang="ts" setup>
import MetamaskIcon from '@/components/base/icons/MetamaskIcon.vue'
import WalletConnectIcon from '@/components/base/icons/WalletConnectIcon.vue'
import CoinbaseIcon from '@/components/gotbit-ui-kit/icons/CoinbaseIcon.vue'
import TrustWalletIcon from '@/components/gotbit-ui-kit/icons/TrustWalletIcon.vue'
import OKXWalletIcon from '@/components/gotbit-ui-kit/icons/OKXWalletIcon.vue'
import { useWeb3 } from '@/gotbit-tools/vue'

const web3 = useWeb3()
</script>

<style lang="scss" scoped></style>
