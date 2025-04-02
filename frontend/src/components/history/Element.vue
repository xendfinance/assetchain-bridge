<template>
  <div class="element text-primary-text w-full">
    <div class="history lg:gap-[10px]">
      <div class="flex items-center gap-[10px] lg:w-[325px] overflow-hidden">
        <div class="flex items-center gap-2">
          <component :is="fromChain.component" />
          <div class="label-text">{{ fromChain.label }}</div>
        </div>
        <ArrowRight />
        <div class="flex items-center gap-2">
          <component :is="toChain.component" />
          <div class="label-text">{{ toChain.label }}</div>
        </div>
      </div>

      <template class="hidden lg:flex w-full items-center lg:justify-between">
        <div class="w-[130px]">
          <span class="mr-2 inline lg:hidden">Date</span>
          <span class="text-[15px]">{{ props.date }}</span>
        </div>

        <div class="w-[100px] hover:text-primary flex items-center gap-1 justify-center">
          <span class="inline lg:hidden">Amount</span>
          <GTooltip
            :hint="fromChain.value === '84532' || toChain.value === '84532' ? formatBigNums(claimAmount * 10, token.symbol) : formatBigNums(claimAmount, token.symbol)"
            text position="right" class="text-[15px]">
            <p class="text-[15px] whitespace-normal text-center">
              <span> {{ fromChain.value === '84532' || toChain.value === '84532' ? formatBigNums(claimAmount * 10,
                token.symbol) : formatBigNums(claimAmount, token.symbol) }} </span><span>{{ ` ${token.symbol}` }}</span>
            </p>
          </GTooltip>
        </div>

        <div class="w-[100px] text-brand-text-additional text-[13px] text-center" :class="{
          'text-success !text-[15px]': isConfirmed,
        }">
          {{ blocksToClaim }}
        </div>

        <GButton class="" primary size="sm" :disabled="props.fulfilled" @click="handleClick">
          {{
            props.fulfilled ? 'Claimed' : disabledConfirmations ? 'Pending...' : 'Claim'
          }}
        </GButton>
      </template>

      <template class="block lg:hidden">
        <div class="w-full flex flex-col justify-between text-[15px] gap-5 mt-5">
          <div class="flex flex-row justify-between w-full">
            <div class="flex flex-col gap-1">
              <span class="text-[12px] font-semibold uppercase text-disabled-text">Date</span>
              <span class="text-[15px] uppercase">{{ props.date }}</span>
            </div>

            <!-- <GTooltip :hint="props.fullAmount" text position="top" class=""> -->
            <div class="flex flex-col gap-1 items-end">
              <span class="text-[12px] font-semibold uppercase text-disabled-text">
                Amount
              </span>
              <span class="text-[15px] uppercase">
                {{ fromChain.value === '84532' || toChain.value === '84532' ? formatBigNums(claimAmount * 10,
                  token.symbol) : formatBigNums(claimAmount, token.symbol) }} {{ token.symbol }}
              </span>
            </div>
            <!-- </GTooltip> -->
          </div>
          <div class="w-full text-brand-text-additional text-[13px] text-center" :class="{
            'text-success !text-[15px]': isConfirmed,
          }">
            {{ blocksToClaim }}
          </div>

          <GButton class="w-full max-w-[288px] self-center" primary :disabled="props.fulfilled" @click="$emit('claim')">
            {{
              props.fulfilled ? 'Claimed' : disabledConfirmations ? 'Pending...' : 'Claim'
            }}
          </GButton>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, unref, watch } from 'vue'

import ArrowRight from '@/components/base/icons/ArrowRight.vue'
import GButton from '@/components/gotbit-ui-kit/GButton.vue'
import GTooltip from '@/components/gotbit-ui-kit/GTooltipCustom.vue'
import { ChainId } from '@/gotbit-tools/vue/types'

import { chainsLabels } from '@/misc/chains'

import { formatBigNums } from '@/misc/utils'
import { currentBlocks, useMedia } from '@/composables'
import { useToken } from '@/store/contracts/token'
import { useBridgeRead } from '@/store/business/bridge'
import { BigNumber, ethers, utils } from 'ethers'

export interface ElementProps {
  from: ChainId
  to: ChainId
  date: string
  amount: number
  fulfilled: boolean
  claimInfo: {
    txBlock: number
    confirmations: number
  }
  borderPrimary?: boolean
}

const token = useToken()
const { sm } = useMedia()

const props = defineProps<ElementProps>()
const emit = defineEmits(['claim'])

const isConfirmed = ref(false)

const disabledConfirmations = computed(() => {
  if (props.from === '42421') return false
  return (
    currentBlocks.value[props.from] -
    props.claimInfo.txBlock -
    props.claimInfo.confirmations <
    0
  )
})

// const blocksToClaim = computed(
//   () => {
//     return `Confirmations: ${currentBlocks.value[props.from] - props.claimInfo.txBlock}/${
//       props.claimInfo.confirmations
//     }`
//   },
//   // (currentBlocks.value[props.from] - props.claimInfo.txBlock)
// )

const blocksToClaim = computed(() => {
  if (props.from === '42421' || props.from === '42420') {
    isConfirmed.value = true
    return 'Confirmed!'
  }
  const difference =
    props.claimInfo.txBlock +
    props.claimInfo.confirmations -
    currentBlocks.value[props.from]
  const confirmed = Math.max(difference, 0) === 0
  const percent =
    props.claimInfo.confirmations > 0
      ? 100 * (1 - difference / props.claimInfo.confirmations)
      : 0
  isConfirmed.value = confirmed

  return confirmed ? 'Confirmed!' : `Blocks left: ${difference} (${percent.toFixed(2)}%)`
})

const fromChain = computed(() => chainsLabels.filter((c) => c.value === props.from)[0])
const toChain = computed(() => chainsLabels.filter((c) => c.value === props.to)[0])

const bridgeRead = useBridgeRead()

const chainDecimal = token.cDecimals[props.to]
const symbolDecimal = chainDecimal ? chainDecimal[token.symbol] : 18

const claimAmount = computed(
  () => (Number(props.amount) * (100 - bridgeRead.feeFulfill(props.to))) / 100
)

// console.log(symbolDecimal, 'dkdk')

const displayAmount = computed(
  () => (Number(props.amount) * (100 - bridgeRead.feeFulfill(props.to))) / 100
)

// console.log(displayAmount.value, 'display')

function handleClick() {
  emit('claim', { claimAmount: claimAmount })
}

const windowWidth = ref<number>(window.innerWidth)
const onWidthChange = () => (windowWidth.value = window.innerWidth)

onMounted(() => window.addEventListener('resize', onWidthChange))
onUnmounted(() => window.removeEventListener('resize', onWidthChange))
</script>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

.element {
  padding-bottom: 24px;

  @include for-size(lg) {
    padding-bottom: 16px;
  }
}

.history {
  // display: flex;
  // flex-direction: column;
  // width: 100%;
  // max-width: 295px;
  // margin: 0 auto;
  // position: relative;

  @include for-size(lg) {
    display: flex;
    width: 100%;
    flex-direction: row;
    align-items: center;
  }
}

.key-text {
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
}

.value-text {
  font-weight: 400;
  font-size: 16px;
}

.label-text {
  font-weight: 500;
  font-size: 15px;
}
</style>
