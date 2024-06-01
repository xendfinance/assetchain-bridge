<template>
  <div class="network space-x-[24px]" v-auto-animate>
    <label v-for="option of props.options" :key="option.value" v-auto-animate>
      <NetworkCheckBox
        :value="option.value"
        :label="option.label"
        :active="option.value === selected && !option.disabled"
        :disabled="option.disabled"
      />
      <input
        class="hidden"
        :disabled="option.disabled"
        type="radio"
        v-model="selected"
        :value="option.value"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import NetworkCheckBox from '@/components/base/NetworkCheckBox.vue'
import type { ChainId } from '@/gotbit-tools/vue/types'

export interface NetworkCheckBoxGroupProps {
  options: { value: ChainId; label: string; disabled: boolean }[]
  modelValue: string
}
const props = defineProps<NetworkCheckBoxGroupProps>()

const emit = defineEmits(['update:modelValue'])

const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<style scoped lang="scss">
@import '@/assets/config.scss';

.network {
  display: flex;
  flex-direction: row;

  width: 100%;
  justify-content: center;
}
</style>
