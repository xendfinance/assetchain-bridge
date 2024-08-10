<template>
  <div class="w-full">
    <p
      class="text-[21px] lg:text-[20px] mb-[12px] lg:mb-5 font-semibold text-primary-text"
    >
      {{ title }}
    </p>
    <p class="text-[11px]">{{ subtitle }}</p>
    <div
      id="selector"
      v-auto-animate
      :class="[active ? '!border-primary-border !border-[1px]' : '', `${props.bg || ''}`]"
      class="card flex flex-col rounded-[10px] mb-5"
      tabindex="0"
    >
      <div
        class="card__selector"
        ref="dropdown"
        @click="options.length ? (active = !active) : (active = false)"
      >
        <div class="flex items-center mr-1">
          <component
            :is="addTokenIcons(chosenToken?.label)?.component"
            class="mr-3 w-6 h-6"
          />
          <div v-if="!options.length">
            <SvgoThreeDots class="w-8 mx-[auto]" />
          </div>
          <span v-else class="font-bold text-[15px]">
            {{ chosenToken?.label }}
          </span>
        </div>
        <!-- <ArrowUpIcon class="scale-75 w-6 h-6" v-if="active" />
        <ArrowUpIcon class="scale-75 rotate-180 w-6 h-6" v-else /> -->
        <ArrowUpIcon v-if="active" />
        <ArrowDownIcon v-else />
      </div>
      <div
        v-if="active"
        class="options bg-select-drop border-[1px] border-primary-border rounded-lg"
      >
        <div
          v-for="option of props.options"
          :key="option?.label"
          class="option"
          :class="{
            disabled: option?.disabled,
          }"
          tabindex="0"
          @click="onSelect(option?.label, option.value)"
          @keyup.enter="onSelect(option?.label, option.value)"
        >
          <component :is="addTokenIcons(option?.label)?.component" class="w-6 h-6" />
          <div class="ml-[10px]">{{ option.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArrowDownIcon from '@/components/gotbit-ui-kit/icons/ArrowDownIcon.vue'
import ArrowUpIcon from '@/components/gotbit-ui-kit/icons/ArrowUpIcon.vue'
import SvgoThreeDots from '@/components/base/ThreeDots.vue'

import { computed, onMounted, onUpdated, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
// import { formatBigNums } from '@/misc/utils'
import { tokensLabels } from '@/misc/tokens'
import { useToken } from '@/store/contracts/token'
import { useFactory } from '@/store/contracts/factory'
import { useBridge } from '@/store/contracts/bridge'
import { useWeb3 } from '@/gotbit-tools/vue'

export interface SelectorProps {
  modelValue?: string
  options: { value: string; label: string; disabled: boolean }[]
  title?: string
  subtitle?: string
  contractBalance?: number
  symbol?: string
  bg?: string
}

const props = defineProps<SelectorProps>()
const emit = defineEmits(['update:modelValue', 'active'])
const token = useToken()
const factory = useFactory()
const bridge = useBridge()
const web3 = useWeb3()

const active = ref(false)
const dropdown = ref<HTMLElement | any>(null)

const chosenToken = computed(() => {
  if (!props.modelValue) {
    const _c = token.tokens[web3.chainId][0]
    if (_c){
      onSelect(_c.label, _c.value)
    }
    return _c ? _c : props.options[0]
  }
  
  const _c = token.tokens[web3.chainId].find(o => o.label === props.modelValue)
  if (!_c) {
    const firstToken = token.tokens[web3.chainId][0]
    if (firstToken){
      onSelect(firstToken.label, firstToken.value)
    }
    
    return firstToken ? firstToken : props.options[0]
  }
  return _c
})

const addTokenIcons = (item: string) => tokensLabels.filter((t) => t.label === item)?.[0]

const onSelect = async (tokenSymbol: string, tokenAddress: string) => {
  const item = token.tokens[web3.chainId].find((o) => o.label === tokenSymbol)
  if (!item) return
  if (item.disabled) return
  emit('update:modelValue', tokenSymbol)
  await token.setToken(tokenSymbol, tokenAddress)
  await factory.getSupportedChains()
  await bridge.upload()

  active.value = false
}

onClickOutside(dropdown, () => (active.value = false))

const options = computed(() => props.options)
</script>

<style lang="scss" scoped>
.card {
  position: relative;
  width: 100%;
  background: #1c5988;
  border: 1px solid #ffffff1a;

  &__selector {
    padding: 11px 24px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
.options {
  width: 100%;
  position: absolute;
  font-weight: 500;
  backdrop-filter: blur(5px);

  top: 56px;
  left: 0;
  z-index: 1;
  max-height: 225px;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0;
  }
  .option {
    display: flex;
    width: 100%;
    padding: 11px 24px;
    transition-duration: 200ms;
    cursor: pointer;

    &:hover {
      background-color: #2aa0f833;
    }
    &:focus {
      background-color: #2aa0f8;
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
  }
}
.font-semibold {
  letter-spacing: 1.3px;
}
</style>
