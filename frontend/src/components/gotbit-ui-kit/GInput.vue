<template>
  <div>
    <div class="flex flex-col">
      <input
        type="text"
        v-bind="props"
        v-model="value"
        class="p-4 border-[1px] bg-primary-bg border-primary-border focus:border-primary-btn rounded-lg h-[48px]"
        :class="{
          invalid: !isValid,
          'opacity-60': props.disabled,
        }"
        :placeholder="placeholder"
        :disabled="disabled"
      />
      <span
        v-if="!isValid"
        class="absolute text-xs text-error right-0 bottom-0 translate-y-[100%] pt-1"
      >
        {{ errorMessage }}
      </span>
    </div>
    <button
      class="absolute top-[12px] right-4 text-primary-btn"
      :disabled="props.disabled"
      @click="value = props.maxValue"
    >
      MAX
    </button>
  </div>
</template>

<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue'
import { computed } from 'vue'

export interface InputProps extends /* @vue-ignore */ Omit<InputHTMLAttributes, 'type'> {
  modelValue?: string
  placeholder?: string
  isValid?: boolean
  errorMessage?: string
  disabled?: boolean
  maxValue?: string
  maxAmount?: string
}

const props = defineProps<InputProps>()
const emit = defineEmits(['update:modelValue'])

// const { balanceToken, decimals } = useTokenRead()

const value = computed({
  get: () => {
    if (props.maxAmount) return props.modelValue?.slice(0, 36)
    return props.modelValue
  },
  set: (text) => emit('update:modelValue', text),
})
</script>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

input[type='text'] {
  font-weight: 400;
  outline: none;
  // background-color: transparent;
  // border-color: #0ed89e;
  transition-duration: 150ms;

  &:disabled {
    &::placeholder {
      color: #5f667e;
    }
  }

  &::placeholder {
    color: #a3a8bb;
  }

  &:focus {
    &::placeholder {
      color: white;
    }
  }

  &.invalid {
    color: #eb5757;
    background: #eb575710;
    border-color: #eb5757;
  }
}
</style>
