<template>
  <div class="wait-dialog w-full mx-auto p-2 md:p-0">
    <div class="title ">
      <div class="mb-10">
        <GLoader v-if="loading"/>
      </div>
      <h1
        v-if="loading || success"
        class="wait-text text-[24px] md:text-[32px] uppercase font-semibold"
      >
        {{ props.waitingMsg }}
      </h1>
      <div v-else-if="!loading && !success">
        <div class="w-full flex justify-center mb-[32px]">
          <ErrorIcon />
        </div>
        <h1
          class="text-[24px] text-primary-text uppercase md:text-[32px] flex items-center font-semibold"
        >
          Error!
        </h1>
      </div>
      
      <div
        v-if="loading && !success"
        class="mt-4 mb-6 text-[16px] text-disabled-text text-center"
      >
        {{ waitingText }}
      </div>
      <div
        v-else-if="!loading && success"
        class="mt-4 mb-6 text-[15px] text-disabled-text text-center"
      >
        {{ props.successMsg }}
      </div>
      <div
        v-else-if="!loading && !success"
        class="mt-4 w-full min-w-[340px] mb-8 text-[15px] text-disabled-text text-center"
      >
        <div v-for="msg in props.errorMsg.split('.') ">{{ msg }}</div>
        <!-- {{ props.errorMsg }} -->
      </div>
      <!-- <GLoader v-if="loading" /> -->
      <GButton
        v-if="!loading && !success"
        primary
        class="mx-auto w-full max-w-[346px] mb-[10px]"
        @click="dialogs.closeCurrentDialog"
      >
        Try again!
      </GButton>
      <GButton
        v-if="!loading && success"
        primary
        class="mx-auto w-full max-w-[346px]"
        @click="dialogs.closeCurrentDialog"
      >
        Done
      </GButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import GButton from '@/components/gotbit-ui-kit/GButton.vue'
import GLoader from '@/components/gotbit-ui-kit/GLoader.vue'
import ErrorIcon from '@/components/base/icons/ErrorIcon.vue'

import { useDialogs } from '@/store/ui/dialogs'

export interface WaitDialogProps {
  loading: boolean
  success: boolean
  waitingMsg: string
  waitingText: string
  errorMsg: string
  successMsg: string
}

const props = defineProps<WaitDialogProps>()
const dialogs = useDialogs()
</script>

<style scoped lang="scss">
@import '@/assets/config.scss';

.wait-dialog {
  display: flex;
  flex-direction: column;
}

.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  // align-self: center;
}

.wait-text {
  text-align: center;

  &__error {
    color: $error;
  }
}

.small-text {
  font-style: normal;
  font-weight: 500;
  text-align: center;
  letter-spacing: -0.14px;
  font-feature-settings:
    'pnum' on,
    'lnum' on;
  color: black;
}

.wait-buttons {
  display: flex;
  justify-content: space-between;
}
</style>
