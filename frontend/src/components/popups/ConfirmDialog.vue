<template>
  <div class="unstake-dialog">
    <div class="title">
      <h1 class="font-semibold  text-[28px] md:text-[32px] uppercase">
        {{ title }}
      </h1>

      <div class="mt-4  text-base text-label-text text-center max-w-[400px]">
        {{ text }}
      </div>
    </div>
    <div
      class="mt-[24px] md:mt-[40px] flex flex-col items-center justify-center gap-5 md:flex-row-reverse w-full"
    >
      <GButton
        primary
        class="w-full md:max-w-[280px]"
        @click="
          () => {
            props.onConfirm()
          }
        "
      >
        {{ buttonText }}
      </GButton>
      <GButton
        outline
        class="w-full md:max-w-[280px]"
        @click="
          () => {
            dialogs.closeCurrentDialog()
            props.onCancel()
          }
        "
      >
        No, cancel
      </GButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import GButton from '@/components/gotbit-ui-kit/GButton.vue'
import { useDialogs } from '@/store/ui/dialogs'

export interface ConfirmDialogProps {
  title: string
  buttonText: string
  text: string
  onConfirm: () => any
  onCancel: () => any
}

const props = defineProps<ConfirmDialogProps>()
const dialogs = useDialogs()
</script>

<style scoped lang="scss">
@import '@/assets/config.scss';

.unstake-dialog {
  display: flex;
  flex-direction: column;
}

.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
}
</style>
