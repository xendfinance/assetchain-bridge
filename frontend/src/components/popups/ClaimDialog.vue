<template>
  <div class="connect-dialog">
    <div class="title">
      <h1 class="connect-text ">Claim</h1>
      <div class="text-center mt-[16px] text-base ">
        Claim your {{ token.symbol }}-tokens to get unfreezed and transferred to the receiving wallet.
        {{ props.amount }} {{ token.symbol }}.
      </div>
    </div>
    <div
      class="mt-[24px] md:mt-[40px] w-full flex items-center justify-center gap-4 md:flex-row"
    >
      <GConnectButton
        red
        cancel
        size="sx"
        class="md:w-[196px] w-[100%] h-[50px]"
        @click="onClose"
      >
        Cancel
      </GConnectButton>
      <GConnectButton
        red
        confirm
        size="sx"
        class="md:w-[196px] w-[100%] h-[50px]"
        @click="props.onConfirm()"
      >
        Confirm
      </GConnectButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useDialogs } from '@/store/ui/dialogs'
import { useToken } from '@/store/contracts/token'
import GButton from '@/components/gotbit-ui-kit/GButton.vue'
import GConnectButton from '@/components/gotbit-ui-kit/ConnectButton.vue'

export interface ClaimPopupProps {
  amount: number
  onCancel: () => any
  onConfirm: () => any
}
const props = defineProps<ClaimPopupProps>()

const ui = useDialogs()
const token = useToken()

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
  font-weight: 500;
  font-size: 28px;

  @include for-size(md) {
    font-size: 32px;
  }

  color: white;
}

.small-text {
  font-style: normal;
  font-weight: 400;
  font-size: 14px;

  color: $white-color;
}
</style>
