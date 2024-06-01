<script setup lang="ts">
import { computed } from 'vue'
import type { InputHTMLAttributes } from 'vue'

import GButton from '@/components/gotbit-ui-kit/GButton.vue'

export interface InputProps extends Omit<InputHTMLAttributes, 'type'> {
  modelValue?: string
  placeholder?: string
  isValid?: boolean
  errorMessage?: string
  disabled?: boolean
  maxValue?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  errorMessage: 'error',
})

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: (text) => emit('update:modelValue', text),
})
</script>

<template>
  <div class="input__container" :class="{ 'input--invalid': isValid }">
    <input
      type="text"
      v-bind="props"
      v-model="value"
      class="input"
      :placeholder="placeholder"
      :disabled="disabled"
    />
    <GButton
      class="input__button"
      ghost
      :disabled="props.disabled"
      @click="value = props.maxValue"
    >
      MAX
    </GButton>
    <span class="input__subtext" v-if="isValid">{{ errorMessage }}</span>
  </div>
</template>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

.input {
  $root: &;
  outline: none;

  height: 56px;
  padding: 1rem;
  line-height: 28px;
  color: $black-color;

  border: solid 2px {
    radius: 0.5rem;
    color: $gray-light-color;
  }

  font: {
    size: 20px;
    feature-settings:
      'pnum' on,
      'lnum' on;
  }

  &::placeholder {
    color: $gray-color;
  }

  &.invalid {
    border-color: $error;
  }

  &__container {
    position: relative;
    letter-spacing: -0.5px;

    button#{$root}__button {
      color: $primary-color;
    }
  }

  &__button {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translate(-50%, -50%);
    line-height: 24px;

    font: {
      weight: 500;
      size: 16px;
      feature-settings:
        'pnum' on,
        'lnum' on;
    }
  }

  &__subtext {
    position: absolute;
    left: 0;
    top: calc(100% + 2px);

    line-height: 22px;

    font: {
      size: 14px;
      feature-settings:
        'pnum' on,
        'lnum' on;
    }
  }

  &--invalid {
    input {
      border-color: $error;
    }

    #{$root}__subtext {
      color: $error;
    }
  }
}
</style>
