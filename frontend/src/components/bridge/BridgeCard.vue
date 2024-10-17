<template>
  <BaseCard class="bridge border-[1px] border-primary-border-card py-6 px-5 md:py-9 md:px-11">
    <div class="flex flex-col lg:flex-row items-center justify-between relative">
      <ChainSelect v-model="from" :options="chainsFrom" title="From" subtitle="Source chain" :loading="bridgeLoading"
        :factoryLoading="_loading" />
      <div class="flex items-center justify-between w-full lg:max-w-[48px] pt-6 lg:pt-16">
        <span class="font-semibold text-[20px] lg:hidden">To</span>
        <ArrowRigth v-if="isNativeToken" class="text-primary-icon pl-2 rotate-90 lg:rotate-0" />
        <button v-else @click="toggle" class="px-3">
          <SwitchIcon class="text-primary-icon hover:text-primary-text lg:rotate-90" />
        </button>
      </div>

      <ChainSelect mobile v-model="to" :options="chainsTo" title="To" subtitle="Destination chain"
        :loading="bridgeLoading" :symbol="symbol" :contract-balance="balanceBridge(to)" :factoryLoading="_loading" />
    </div>
    <div class="mt-7 w-full">
      <div class="flex items-center justify-between text-[11px] text-white">
        <p class="text-[11px] text-label-text">Enter amount</p>
        <div v-if="login && !token.loading" class="text-end flex items-center">
          <span class="pr-1 text-[11px] text-label-text"> Balance</span>
          <GTooltip :hint="`${balanceToken(from)} ${token.symbol}`" text position="top">
            <span class="flex text-[11px] text-label-text">
              {{
                (token.symbol === "BTC" && from === '200810') || (token.symbol === "BTC" && from === '200901') ?
                balanceToken(bridgeUI.from) : formatBigNums(
                  balanceToken(from).toBigNumber(decimals).formatString(decimals) ?? 0, token.symbol
                )
              }}
              {{ token.symbol }}
            </span>
          </GTooltip>
        </div>
        <SvgoThreeDots v-else-if="token.loading" class="w-8" />
      </div>
      <GInput v-model="bridgeUI.inputAmount" :placeholder="`0 ${token.symbol}`" :is-valid="isValidInput"
        :error="isValidInput" :error-message="errorMessage" :max-value="balanceToken(from)" :disabled="!login"
        class="mt-1" :maxAmount="bridgeRead.limitPerSend(from)?.toString()" />
      <span v-if="login" class="mt-1 block text-[11px] text-disabled-text"
        :class="{ 'opacity-0 md:opacity-100': !isValidInput }">
        Fee: {{ isNaN(totalFees) ? 0 : totalFees }}
      </span>
    </div>
    <div class="mt-7 w-full">
      <div class="flex items-center justify-between text-[15px]">
        <p class="text-[11px] text-label-text">You receive</p>
      </div>

      <div
        class="h-[48px] text-label-text border-[1px] bg-primary-bg border-primary-border rounded-[8px] mt-1 pl-4 text-[15px] flex items-center"
        :class="{
          'opacity-50 text-disabled-text': !login,
          '!text-primary-text': !!willReceive,
        }">
        {{ Number(willReceive) > 0 ? willReceive : 0 }}

        {{ token.symbol }}
      </div>
      <div v-if="login" class="text-[11px] md:text-sm text-label-text text-end flex items-center">
        <span class="md:hidden pr-1 text-[11px] text-label-text"> After receiving </span>
        <span class="hidden md:block pr-1 text-[11px] text-disabled-text">
          Balance after receiving
        </span>
        <GTooltip v-if="!token.loading" :hint="`${balanceAfterReceive} ${token.symbol}`" text position="top">
          <span class="flex text-[11px] text-disabled-text">
            <!-- {{ !bridgeUI.inputAmount ? 0 : formatBigNums(balanceAfterReceive.toString() ?? 0) }} -->
            {{ formatBigNums(balanceAfterReceive, token.symbol) }}
            {{ token.symbol }}
          </span>
        </GTooltip>
        <SvgoThreeDots v-else class="w-8" />
      </div>
    </div>
    <div class="flex font-bold items-center justify-center md:justify-end mt-6">
      <div class="w-full flex flex-col md:flex-row gap-[10px] md:gap-5 md:items-center justify-between"
        :class="{ 'md:!justify-end': !login }">
        <LogoutButton v-if="login" />
        <GButton v-if="login" class="w-full max-w-[280px] md:max-w-[143px] h-[48px] self-center md:self-auto" primary
          :disabled="!isValid || !bridgeUI.inputAmount || allowanceLoading"
          @click="hasAllowance ? onTransfer() : onEnable()">
          {{ allowanceLoading ? 'Loading...' : hasAllowance ? 'Transfer' : 'Approve' }}
        </GButton>
        <GButton v-else class="w-full max-w-[280px] md:max-w-[194px] h-[48px] self-center md:self-auto" primary
          @click="dialogs.openDialog('connectDialog', {})">
          Connect Wallet
        </GButton>
      </div>
    </div>
  </BaseCard>
</template>

<script lang="ts" setup>
import { ref, watch, computed, unref, onMounted, watchEffect } from 'vue'

import SvgoThreeDots from '@/components/base/ThreeDots.vue'
import BaseCard from '@/components/gotbit-ui-kit/GCard.vue'
import ChainSelect from '@/components/bridge/ChainSelect.vue'
import type { ChainId } from '@/gotbit-tools/vue/types'
import { chainsLabels } from '@/misc/chains'
import SwitchIcon from '@/components/base/icons/SwitchIcon.vue'
import ArrowRigth from '@/components/base/icons/ArrowRight.vue'
import GInput from '@/components/gotbit-ui-kit/GInput.vue'
import { useUIBridge } from '@/store/ui/bridge'
import { useDialogs } from '@/store/ui/dialogs'
import { useTokenRead } from '@/store/business/token'
import GButton from '@/components/gotbit-ui-kit/GButton.vue'
import { useWallet, useWeb3 } from '@/gotbit-tools/vue'
import { useBridgeWrite, useBridgeRead } from '@/store/business/bridge'
import {
  DEFAULT_NATIVE_TOKEN_CONTRACT_1,
  DEFAULT_NATIVE_TOKEN_CONTRACT_2,
  formatBigNums,
} from '@/misc/utils'
import GTooltip from '@/components/gotbit-ui-kit/GTooltipCustom.vue'
import { useToken } from '@/store/contracts/token'
import LogoutButton from '@/components/base/LogoutButton.vue'
import { useDebounceFn } from '@vueuse/core'
import { useFactoryRead } from '@/store/business/factory'

export interface ElementProps {
  tokenSymbol: string
  tokens: any
}

const props = defineProps<ElementProps>()
const symbol = computed(() => props.tokenSymbol)

const dialogs = useDialogs()
const bridgeUI = useUIBridge()
const { balanceToken, addresses, allowance, balanceBridge } = useTokenRead()
const token = useToken()
const { login, wallet } = useWallet()
const bridgeWrite = useBridgeWrite()
const bridgeRead = useBridgeRead()
const { loading: bridgeLoading } = useBridgeRead()
const { loading: _loading } = useFactoryRead()

const web3 = useWeb3()

// const nativeToken = computed(() =>
//   token.tokens[web3.chainId].filter(
//     (t) =>
//       t.value === DEFAULT_NATIVE_TOKEN_CONTRACT_1 ||
//       t.value === DEFAULT_NATIVE_TOKEN_CONTRACT_2,
//   ),
// )

const isNativeToken = computed(() => {
  return ('RWA' === props.tokenSymbol)
})
const decimals = computed(() => token.decimals[web3.chainId])
const decimalsTo = computed(() => token.decimals[unref(to) as ChainId])

const chainsFrom = ref<{ value: ChainId; label: string; disabled: boolean }[]>([])
const chainsTo = ref<{ value: ChainId; label: string; disabled: boolean }[]>([])
const from = ref()
const to = ref()

const normalizedChainsLabels = computed(() =>
  chainsLabels
    .filter((item) => unref(bridgeRead.supportedChains).includes(item.value))
    .map((chain) => ({
      value: chain.value as ChainId,
      label: chain.label,
      disabled: from.value === chain.value,
    }))
)

onMounted(() => {
  if (!from.value && !to.value) {
    from.value = normalizedChainsLabels.value[0]?.value
    to.value = normalizedChainsLabels.value[1]?.value
  }

  chainsTo.value = unref(normalizedChainsLabels)
    .map((c) => ({
      value: c.value,
      label: c.label,
      disabled: from.value === c.value ? true : false,
    }))
  chainsFrom.value = unref(normalizedChainsLabels)?.map((c) => ({
    value: c.value,
    label: c.label,
    disabled: false,
  }))

  bridgeUI.from = from.value
  bridgeUI.to = to.value
})

watch(
  [
    normalizedChainsLabels,
    token.symbol,
    web3.chainId,
    // isNativeToken,
    // bridgeRead.supportedChains,
  ],
  () => {
    if (!from.value && !to.value) {
      from.value = normalizedChainsLabels.value[0]?.value
      to.value = normalizedChainsLabels.value[1]?.value
    }

    if ((isNativeToken.value && from.value === '42421') || (isNativeToken.value && from.value === '42420')) toggle()

    chainsTo.value = isNativeToken.value
      ? []
      : // unref(normalizedChainsLabels)
      //     ?.filter((c) => c.value === '42421')
      //     .map((c) => ({
      //       value: c.value,
      //       label: c.label,
      //       disabled: false,
      //     }))
      unref(normalizedChainsLabels)
        // .filter((item) => unref(bridgeRead.supportedChains).includes(item.value))
        .map((c) => ({
          value: c.value,
          label: c.label,
          disabled: from.value === c.value ? true : false,
        }))
    chainsFrom.value = isNativeToken.value
      ? []
      : unref(normalizedChainsLabels)?.map((c) => ({
        value: c.value,
        label: c.label,
        disabled: false,
      }))
    if (to.value === from.value) {
      const _to = normalizedChainsLabels.value.filter(n => n.value !== from.value)
      to.value = _to.length > 0 ? _to[0].value : chainsLabels[1].value
    }
    bridgeUI.from = from.value
    bridgeUI.to = to.value
  }
)

const onTransfer = () => {
  bridgeUI.network = from.value
  bridgeWrite.bridge(tokenAddress.value)
}

const feeSend = computed(
  () => (Number(bridgeUI.inputAmount) * bridgeRead.feeSend(from.value)) / 100
)
const totalFees = computed(
  () =>
    ((Number(bridgeUI.inputAmount) - feeSend.value) * bridgeRead.feeFulfill(to.value)) /
    100 +
    feeSend.value
)

watch(
  () => login.value,
  (isLogin) => {
    if (!isLogin) bridgeUI.inputAmount = ''
  }
)

const willReceive = computed(() => Number(bridgeUI.inputAmount) - totalFees.value)

const balanceAfterReceive = computed(() => {
  try {
    return balanceToken(to.value)
      .toBigNumber(unref(decimalsTo))
      .add(willReceive.value?.toString().toBigNumber(unref(decimalsTo)))
      .formatString(unref(decimalsTo))
  } catch (e) {
    return '0'
  }
})

const hasAllowance = computed(() => {
  if (!token || !token.symbol) return false
  if ((token.symbol === "RWA" && from.value === '42421') || (token.symbol === "RWA" && from.value === '42420') || (token.symbol === "BTC" && from.value === '200810') || (token.symbol === "BTC" && from.value === '200901')) return true
  return allowance(bridgeUI.from)
})

const tokenAddress = computed(() => {
  const address =
    addresses(from.value).value?.find((item) => item.label === symbol.value)?.value ?? ''

  return address || props.tokens[bridgeUI.network]?.[0]?.value
})

const onEnable = () => {
  bridgeUI.network = from.value
  // console.log('BRIDGE_CARD', {
  //   network: bridgeUI.network,
  //   inputAmount: bridgeUI.inputAmount,
  //   from: bridgeUI.from,
  //   tokenAddress: tokenAddress.value,
  // })

  bridgeWrite.enable(bridgeUI.inputAmount, bridgeUI.from, tokenAddress.value)
}

const allowanceLoading = ref(false)

const checkAllowance = useDebounceFn(async () => {
  if (!login.value) return false
  if (!token || !token.symbol) return false
  if ((token.symbol === "RWA" && web3.chainId === '42421') || (token.symbol === "RWA" && web3.chainId === '42420') || (token.symbol === "BTC" && web3.chainId === '200810') || (token.symbol === "BTC" && web3.chainId === '200901')) return false
  allowanceLoading.value = true
  // console.log(wallet.value, bridgeUI, 'allowance')
  await token.hasAllowance(
    wallet.value,
    bridgeUI.from,
    bridgeUI.inputAmount,
    unref(tokenAddress)
  )
  allowanceLoading.value = false

  return false
}, 500)

watchEffect(async () => {
  bridgeUI.from
  bridgeUI.inputAmount
  checkAllowance()
})

const isValidInput = computed(() => {
  try {
    const amount = bridgeUI.inputAmount.toBigNumber(unref(decimals))

    return (
      (
        amount.gt(0) &&
        amount.lte(balanceToken(bridgeUI.from)?.toString().toBigNumber(unref(decimals))) &&
        bridgeUI.inputAmount.split('.').length <= 2 &&
        (bridgeUI.inputAmount.split('.').length === 2
          ? bridgeUI.inputAmount.split('.')[1].length <= unref(decimals)
          : true) &&
        bridgeUI.inputAmount[0] !== '.' &&
        bridgeRead.limitPerSend(bridgeUI.from).gte(amount)) ||
      !bridgeUI.inputAmount
    )
  } catch (e) {
    return false
  }
})

const isValid = computed(() => {
  try {
    const amount = bridgeUI.inputAmount.toBigNumber(unref(decimals))
    // if (allowance(from.value).lt(bridgeUI.inputAmount.toBigNumber()) && amount.gt(0))
    //   return true
    return (
      (
        amount.gt(0) &&
        amount.lte(balanceToken(bridgeUI.from)?.toString().toBigNumber(unref(decimals))) &&
        bridgeUI.inputAmount.split('.').length <= 2 &&
        (bridgeUI.inputAmount.split('.').length === 2
          ? bridgeUI.inputAmount.split('.')[1].length <= unref(decimals)
          : true) &&
        bridgeUI.inputAmount[0] !== '.' &&
        bridgeRead.limitPerSend(bridgeUI.from).gte(amount)) ||
      !bridgeUI.inputAmount
    )
  } catch (e) {
    return false
  }
})

const errorMessage = computed(() => {
  try {
    const amount = bridgeUI.inputAmount.toBigNumber(unref(decimals))
    if (bridgeRead.limitPerSend(bridgeUI.from).lte(amount) && token.symbol !== 'BTC')
      return `Amount must be lower then ${bridgeRead
        .limitPerSend(bridgeUI.from)
        .formatString(unref(decimals), 0)}`
    if (Number(bridgeUI.inputAmount) < 0.1 && (token.symbol !== 'BTC')) return 'Amount must be more than 1'
    // if (amount.lte(0)) return 'Amount must be more than 0'

    if (amount.gt(balanceToken(from.value)?.toString().toBigNumber(unref(decimals))))
      return 'Transfer amount exceeds balance'

    // if (amount.gt(allowance(from.value)))
    //   return 'Transfer amount exceeds allowance, please approve'

    if (bridgeUI.inputAmount.split('.').length > 2) {
      return 'Invalid input'
    }
    if (
      bridgeUI.inputAmount.split('.').length === 2 &&
      bridgeUI.inputAmount.split('.')[1].length > unref(decimals)
    )
      return `Supported only ${token.decimals} numbers after point`
  } catch (e) {
    return 'Amount must be a number'
  }
})

const toggle = async () => {
  const a = to.value
  to.value = from.value
  from.value = a
}

watch(from, (newValue) => {
  chainsTo.value.map((c) =>
    c.value === newValue ? (c.disabled = true) : (c.disabled = false)
  )[0]
  if (chainsTo.value.find((c) => c.value === to.value)?.disabled) {
    to.value = chainsTo.value.find((c) => !c.disabled)!.value
  }
  bridgeUI.from = from.value
})

watch(to, (newToValue) => {
  bridgeUI.to = newToValue
})
</script>

<style lang="scss" scoped>
.bridge {
  width: 100%;
  max-width: 820px;
}
</style>