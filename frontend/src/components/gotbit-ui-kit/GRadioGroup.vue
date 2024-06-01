<script setup lang="ts">
import { computed, onMounted } from 'vue'
import DefaultRadio from '@/components/gotbit-ui-kit/defaults/DefaultRadio.vue'

export interface radioGroupProps {
  disabled?: boolean
  options: { value: string; label?: string }[]
  modelValue: string
}
const props = defineProps<radioGroupProps>()

const emit = defineEmits(['update:modelValue'])

const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <label v-for="option of props.options" :key="option.value">
    <DefaultRadio :label="option.label" :active="option.value === selected" />
    <input
      class="toggle_radio__input"
      type="radio"
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
