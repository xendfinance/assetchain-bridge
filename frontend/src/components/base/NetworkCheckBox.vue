<template>
  <div class="container">
    <div class="checkbox" :class="{ active: props.active }">
      <component :class="{ disabled: props.disabled }" :is="chainImg" />
      <div v-if="props.active" class="selected">
        <div class="check_icon"><CheckIcon /></div>
      </div>
    </div>
    <div class="label">{{ props.label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChainId } from '@/gotbit-tools/vue/types'

import { chainsLabels } from '@/misc/chains'

import CheckIcon from '@/components/base/icons/CheckIcon.vue'

export interface CheckBoxProps {
  value: ChainId
  label: string

  active: boolean
  disabled?: boolean
}
const props = defineProps<CheckBoxProps>()

const chainImg = computed(
  () => chainsLabels.filter((c) => c.value === props.value)[0].component,
)
</script>

<style scoped lang="scss">
@import '@/assets/config.scss';
.container {
  display: flex;
  flex-direction: column;
  align-items: center;

  .checkbox {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    width: 48px;
    height: 48px;
    position: relative;
    border: 1px solid $gray-light-color;
    border-radius: 9999px;
    cursor: pointer;

    &.active {
      border: 1px solid $primary-color !important;
    }
    .disabled {
      opacity: 30%;
      cursor: not-allowed;
    }
    .selected {
      width: 20px;
      height: 20px;
      background-color: $primary-color;
      border-radius: 9999px;

      position: absolute;
      bottom: -10%;
      right: 0;

      .check_icon {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: row;

        align-items: center;
        justify-content: center;
      }
    }
  }
  .label {
    color: $gray-dark-color;

    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
  }
}
</style>
