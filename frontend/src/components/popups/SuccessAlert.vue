<template>
  <div class="w-full md:max-w-[340px] flex flex-col items-center">
    <div class="title flex flex-col items-center justify-center text-center">
      <div class="mt-6">
        <SuccessIcon class="mb-8"/>
      </div>
      <h1 class="text-primary-text text-[24px] md:text-[32px] uppercase">Transaction confirmed</h1>
      <span
        class="text-[16px]  text-center text-disabled-text w-full mt-3 leading-5"
      >
        {{ props.label }}
      </span>
      <div
        v-if="props.txHash"
        class="tx-hash mt-8 text-[15px] text-primary-text text-center"
      >
        <a
          :href="scannersLink.getTx(props.chainId, props.txHash)"
          target="_blank"
          class="link"
        >
          {{ props.txHash.shortAddress(20, 6) }}
        </a>
        <div class="flex gap-[5px] items-center relative">
          <CopyIcon
            class="cursor-pointer text-label-text hover:text-primary-text"
            @click="copyText"
          />
          <!-- <span v-if="copied" v-auto-animate class="copied text-[11px]">Copied</span> -->
        </div>
      </div>
    </div>
    <GButton
      class="mt-[24px] text-[12px] w-full max-w-[364px] md:max-w-[177px] mb-[10px]"
      primary
      @click="dialogs.closeCurrentDialog()"
    >
      Done
    </GButton>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import CopyIcon from '@/components/base/icons/CopyIcon.vue'
import SuccessIcon from '@/components/base/icons/SuccessIcon.vue'
import GButton from '@/components/gotbit-ui-kit/GButton.vue'

import { scannersLink } from '@/gotbit-tools/vue'
import type { ChainId } from '@/gotbit-tools/vue/types'
import { useDialogs } from '@/store/ui/dialogs'
import { useClipboard } from '@vueuse/core'

export interface SuccessAlertProps {
  btnText?: string
  label: string
  txHash: string
  chainId: ChainId
}
const props = defineProps<SuccessAlertProps>()
const emits = defineEmits(['copy'])

const dialogs = useDialogs()

// const copied = ref(false)
const clipboard = useClipboard()

const copyText = async () => {
  emits('copy')
  await clipboard.copy(props.txHash)
  // copied.value = true
  // setTimeout(() => (copied.value = false), 2000)
}
</script>

<style scoped lang="scss">
@import '@/assets/config.scss';

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
  display: flex;
  flex-direction: row;
  gap: 16px;

  font-style: normal;
  font-weight: 700;
  font-size: 40px;
  line-height: 48px;

  color: $success;
}

.tx-hash {
  // margin-top: 16px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  .link {
    color: white;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
.copied {
  font-weight: 500;
  position: absolute;
  z-index: 10;

  right: 0px;
  top: -20px;
  @include for-size(md) {
    top: -18px;
    right: -2px;
  }
}
.small-text {
  margin-top: 14px;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 28px;
  // color: black;
}
</style>
