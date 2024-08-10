<template>
  <div
    class="flex mx-auto md:mx-0 max-w-[320px] md:max-w-[360px] items-center justify-between gap-2 h-[48px] border border-primary-border-card rounded-[38.59px] bg-primary-card px-[6px]"
  >
    <div class="w-8 h-8 rounded-[10px] bg-transparent flex justify-center items-center">
      <component
        :is="
          chainsLabels.filter((o) => o.value === web3.chainId)[0]?.component ??
          chainsLabels[0].component
        "
      />
    </div>

    <span class="text-sm text-label-text">
      <!-- {{ formatBigNums(balanceTokenNumber(web3.chainId)).toString() }}  -->
      {{
        formatBigNums(balanceToken(web3.chainId).toBigNumber(18).formatString(18) ?? 0, token.symbol)
      }}
      {{ symbol }}
    </span>
    <GButton
      class="!h-[44px] md:!h-[36px] px-2 py-2 ml-2 !rounded-[38.59px] !border-primary-border-card !bg-[#ffffff15]"
      v-if="login"
      outline
      :login="login"
      @click="$emit('click')"
      @mouseenter="$emit('mouseenter')"
    >
      <div class="w-6 h-6 rounded-[10px] bg-[#D9D9D9] flex justify-center items-center">
        <WalletTypeIcons class="pt-[1px]" />
      </div>
      <span class="text-sm ml-2 text-label-text">{{ walletLabel }}</span>
    </GButton>
  </div>
</template>

<script setup lang="ts">
import GButton from '../gotbit-ui-kit/GButton.vue'
import { useWallet, useWeb3 } from '@/gotbit-tools/vue'
import WalletTypeIcons from './WalletTypeIcons.vue'
import { useTokenRead } from '@/store/business/token'
import { chainsLabels } from '@/misc/chains'
import { formatBigNums } from '@/misc/utils'
import { useToken } from '@/store/contracts/token'

const { walletLabel, login } = useWallet()
const web3 = useWeb3()
const token = useToken()

const { symbol, addresses, balanceToken, getCurrentSymbol } = useTokenRead()
</script>
