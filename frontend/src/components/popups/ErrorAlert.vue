<template>
  <div class="connect-dialog">
    <div class="title">
      <h1
        class="md:leading-[48px] text-[15px] md:text-[23px] text-[#DE2366] font-medium "
      >
        Error!
      </h1>
      <div
        class="text-lg mt-2 md:mt-[16px] md:text-xl text-[10px] md:text-[11px] "
      >
        {{ props.label }}
      </div>
    </div>
    <GButton
      gradient
      size="sm"
      class="w-[295px] md:w-[340px] h-[50px]"
      @click="dialogs.closeCurrentDialog()"
    >
      Okay
    </GButton>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import GButton from '@/components/gotbit-ui-kit/GButton.vue'

import { useDialogs } from '@/store/ui/dialogs'

import { useWindowSize } from '@vueuse/core'

export interface ErrorAlertProps {
  label: string
}
const props = defineProps<ErrorAlertProps>()

const dialogs = useDialogs()
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

  color: $error;
}

.small-text {
  margin-top: 16px;

  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 28px;

  color: $gray-dark-color;
}

.connect-button {
  margin-top: 32px;

  display: flex;
  flex-direction: row;

  gap: 8px;

  width: 272px;
  height: 72px;

  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
}
</style>
