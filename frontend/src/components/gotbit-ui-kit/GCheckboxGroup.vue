<script setup lang="ts">
import { computed } from 'vue'
import DefaultCheckbox from '@/components/gotbit-ui-kit/defaults/DefaultCheckbox.vue'

export interface radioGroupProps {
  disabled?: boolean
  options: { value: string; label?: string }[]

  modelValue: string[]
}
const props = defineProps<radioGroupProps>()

const emit = defineEmits(['update:modelValue'])

const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <label v-for="(option, index) of props.options" :key="index">
    <DefaultCheckbox
      :label="option.label"
      :active="selected.some((item) => item === option.value)"
    />
    <input
      class="toggle_radio__input"
      type="checkbox"
      v-model="selected"
      :value="option.value"
    />
  </label>
</template>

<style scoped lang="scss">
.toggle_radio__input {
  display: none;
}
</style>
