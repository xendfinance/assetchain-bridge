<template>
  <div class="w-full">
    <p class="font-semibold text-[20px] mb-[12px] md:mb-[32px] text-primary-text" :class="{
      'hidden lg:block': props.mobile,
    }">
      {{ title }}
    </p>
    <p class="text-[11px] mb-1 text-label-text">{{ subtitle }}</p>
    <div id="selector" v-auto-animate class="card flex flex-col border bg-primary-bg rounded-lg duration-150" tabindex="0"
      :class="active ? 'border-primary-btn' : 'border-primary-border'">
      <div class="card__selector" ref="dropdown" @click="active = !active">
        <div v-if="props.loading || props.factoryLoading || normalizedChainsLabels.length <= 0">
          <SvgoThreeDots class="w-6 mx-[auto]" />
        </div>
        <div v-else class="flex items-center mr-1">
          <component :is="selectedChain?.component" class="mr-3" />
          <span class="text-label-text text-[15px]" :class="{
            '!text-primary-text': active,
          }">
            <!-- {{
              chainsLabels.filter((o) => o.value === props.modelValue)[0]?.label ??
              chainsLabels[0].label
            }} -->
            {{ selectedChain?.label }}
          </span>
        </div>
        <ArrowUpIcon v-if="active" />
        <ArrowDownIcon v-else />
      </div>

      <div v-if="active" class="options bg-select-drop border-[1px] border-primary-border rounded-lg">
        <div v-for="option of options" :key="option.label" class="option" :class="{ disabled: option.disabled }"
          tabindex="0" @click="onSelect(option.value)" @keyup.enter="onSelect(option.value)">
          <component :is="chainsLabels.filter((o) => o.value === option.value)[0]?.component" class="mr-3" />
          {{ option.label }}
        </div>
      </div>
    </div>
    <p :class="{
      invisible: props.title === 'From' || (modelValue === '42421' && symbol !== 'RWA') || (modelValue === '42420' && symbol !== 'RWA') || (modelValue === '200810' && symbol !== 'BTC') || (modelValue === '200901' && symbol !== 'BTC'),
    }" class="text-[14px] text-[#A0A0A0]">
      Total liquidity
      {{
        contractBalance
        ? `${formatBigNums(contractBalance, props.symbol!)} ${props.symbol}`
        : 'Loading...'
      }}
      <!-- ({{ chainsLabels.filter((o) => o.value === props.modelValue)[0]?.label }}) -->
      ({{ selectedChain?.label }})
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, unref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { chainsLabels } from '@/misc/chains'
import type { ChainId } from '@/gotbit-tools/vue/types'
import ArrowDownIcon from '@/components/gotbit-ui-kit/icons/ArrowDownIcon.vue'
import ArrowUpIcon from '@/components/gotbit-ui-kit/icons/ArrowUpIcon.vue'
import SvgoThreeDots from '@/components/base/ThreeDots.vue'
import { useBridgeRead } from '@/store/business/bridge'
import { formatBigNums } from '@/misc/utils'
import { useTokenRead } from '@/store/business/token'
import { useToken } from '@/store/contracts/token'
import { XEND_CHAIN } from '@/gotbit.config'

export interface SelectorProps {
  options: { value: ChainId; label: string; disabled: boolean }[]
  loading: boolean
  modelValue?: ChainId
  title?: string
  subtitle?: string
  mobile?: boolean
  contractBalance?: string
  symbol?: string
  factoryLoading: boolean
}

const props = defineProps<SelectorProps>()
const emit = defineEmits(['update:modelValue', 'active'])

const active = ref(false)
const dropdown = ref<HTMLElement | any>(null)

const bridgeRead = useBridgeRead()
const token = useToken()
const normalizedChainsLabels = computed(() =>
  chainsLabels.filter((item) => unref(bridgeRead.supportedChains).includes(item.value))
)

onClickOutside(dropdown, () => {
  if (active.value) active.value = false
})

const onSelect = async (value: string) => {
  const item = props.options.filter((o) => o.value === value)[0]
  if (item.disabled) return
  emit('update:modelValue', value)
  active.value = false
}


const selectedChain = computed(() => {
  const chain = normalizedChainsLabels.value.find(n => n.value === props.modelValue)
  if (!chain) {
    if (normalizedChainsLabels.value.length > 0) {
      if (props.title && props.title.toLowerCase() === 'from') {
        const nonAssetChain = normalizedChainsLabels.value.find(v => v.value !== XEND_CHAIN)
        const _modalValue = nonAssetChain ? nonAssetChain : normalizedChainsLabels.value[0]
        emit('update:modelValue', _modalValue.value)
        return _modalValue;
      } else {
        const assetChain = normalizedChainsLabels.value.find(v => v.value === XEND_CHAIN)
        const _modalValue = assetChain ? assetChain : normalizedChainsLabels.value[1]
        emit('update:modelValue', _modalValue.value)
        return _modalValue
      }
    } else {
      if (props.title && props.title.toLowerCase() === 'from') {
        emit('update:modelValue', chainsLabels[0].value)
        return chainsLabels[0]
      } else {
        emit('update:modelValue', chainsLabels[1].value)
        return chainsLabels[1]
      }
    }

  }
  return chain
})

</script>

<style lang="scss" scoped>
.card {
  position: relative;
  width: 100%;

  &__selector {
    padding: 11px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.options {
  width: 100%;
  position: absolute;
  top: 64px;
  left: 0;
  z-index: 1;
  max-height: 225px;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    width: 0;
  }

  .option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 11px 24px;
    transition-duration: 200ms;
    cursor: pointer;

    &:hover {
      background-color: rgba(32, 66, 184, 0.2);
    }

    &:focus {
      background-color: rgba(32, 66, 184, 0.2);
    }

    &:first-child {
      margin-top: 11px;
    }

    &:last-child {
      margin-bottom: 11px;
    }
  }

  .disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: rgba(255, 255, 255, 0.06);

    &:hover {
      background-color: rgba(255, 255, 255, 0.06);
    }
  }
}
</style>