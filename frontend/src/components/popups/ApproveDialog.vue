<template>
  <div class="connect-dialog">
    <div class="title">
      <h1 class="font-medium text-2xl md:text-[32px]">Approve</h1>
      <div class="small-text text-center mt-[16px]">
        You are going to transfer {{ props.amount }} {{ token.symbol }} from
        {{ chainLabel(props.from) }} to {{ chainLabel(props.to) }}.
      </div>
    </div>
    <div
      class="mt-[24px] md:mt-[40px] w-full flex items-center justify-center gap-4 md:flex-row"
    >
      <GButton primary size="md" class="md:w-[196px] w-[100%]" @click="onClose">
        Cancel
      </GButton>
      <GButton
        primary
        size="md"
        class="md:w-[196px] w-[100%]"
        @click="
          () => {
            props.onConfirm()
          }
        "
      >
        Yes, approve
      </GButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import GButton from '@/components/gotbit-ui-kit/GButton.vue'

import { useDialogs } from '@/store/ui/dialogs'
import { ChainId } from '@/gotbit-tools/vue/types'
import { useToken } from '@/store/contracts/token'

import { chainsLabels } from '@/misc/chains'

export interface ApprovePopupProps {
  from: ChainId
  to: ChainId
  amount: string
  onCancel: () => any
  onConfirm: () => any
}
const props = defineProps<ApprovePopupProps>()

const ui = useDialogs()
const token = useToken()

const chainLabel = (chainId: ChainId) =>
  chainsLabels.filter((c) => c.value === chainId)[0].label

const onClose = () => {
  ui.closeCurrentDialog()
  props.onCancel()
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

.connect-text {
  font-weight: 700;
}

.small-text {
  font-size: 14px;
  @include for-size(md) {
    font-size: 18px;
  }
}
</style>
