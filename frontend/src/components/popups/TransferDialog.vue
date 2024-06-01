<template>
  <div class="connect-dialog">
    <div class="title">
      <h1 class="text-[24px] md:text-[32px] ">Transfer</h1>
      <div class="text-center mt-[12px] text-[16px] text-label-text ">
        You are going to transfer from
        {{ chainLabel(props.from) }} to {{ chainLabel(props.to) }}
      </div>
      <div class="text-[16px] text-label-text text-center mt-[12px] ">
        {{ !isShow ? removeLeadingZeros(props.amount) : '' }}
        {{ !isShow ? token.symbol : '' }}
      </div>
      <div class="mt-[30px] flex items-center gap-3 text-label-text">
        <div class="flex items-center gap-2 t">
          <component :is="getLabelIcon(props.from)" class="" />
          <span class="text-sm font-semibold ">{{ chainLabel(props.from) }}</span>
        </div>
        <ArrowRight color="#8B42AA" />
        <div class="flex items-center gap-2">
          <component :is="getLabelIcon(props.to)" />
          <span class="text-sm font-semibold ">{{ chainLabel(props.to) }}</span>
        </div>
        <div class="ml-3 font-semibold text-[15px] hidden md:block" v-if="isShow">
          {{ removeLeadingZeros(props.amount) }}
          {{ token.symbol }}
        </div>
      </div>
    </div>
    <div
      class="mt-[45px] md:mt-[40px] w-full flex flex-col-reverse items-center justify-center gap-4 md:flex-row"
    >
      <GButton outline class="md:w-[196px] w-[100%]" @click="ui.closeCurrentDialog">
        No, cancel
      </GButton>
      <GButton
        primary
        class="md:w-[196px] w-[100%]"
        @click="props.onConfirm"
      >
        Yes, transfer
      </GButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ChainId } from '@/gotbit-tools/vue/types'
import ArrowRight from '@/components/base/icons/ArrowRight.vue'
import { useDialogs } from '@/store/ui/dialogs'
import { useToken } from '@/store/contracts/token'

import GButton from '@/components/gotbit-ui-kit/GButton.vue'

import { chainsLabels } from '@/misc/chains'
import { computed, onMounted, onUnmounted, ref } from 'vue'

export interface ApprovePopupProps {
  from: ChainId
  to: ChainId
  amount: string
  onCancel: () => any
  onConfirm: () => any
}
const props = defineProps<ApprovePopupProps>()

const chainLabel = (chainId: ChainId) =>
  chainsLabels.filter((c) => c.value === chainId)[0].label

const getLabelIcon = (chainId: ChainId) =>
  chainsLabels.filter((c) => c.value === chainId)[0].component

const ui = useDialogs()
const token = useToken()

const onClose = () => {
  ui.closeCurrentDialog()
}

const windowWidth = ref<number>(window.innerWidth)
const isShow = computed((): boolean => {
  if (windowWidth.value < 768) return false
  else return true
})

const onWidthChange = () => (windowWidth.value = window.innerWidth)

onUnmounted(() => window.removeEventListener('resize', onWidthChange))
onMounted(() => window.addEventListener('resize', onWidthChange))

function removeLeadingZeros(numberString: string) {
  if (numberString.includes('.')) {
    const srt = numberString.split('.')
    return `${srt[0]}.${srt[1].slice(0, 2)}...`
  } else {
    return parseInt(numberString)
  }
}
</script>

<style scoped lang="scss">
@import '@/components/gotbit-ui-kit/assets/config.scss';

.connect-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
}
</style>
