<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue'
import type { Size } from '@/components/gotbit-ui-kit/types'
import { computed } from 'vue'

export interface SwitcherProps extends InputHTMLAttributes {
  size?: Size

  modelValue?: boolean

  disabled?: boolean
}

const props = withDefaults(defineProps<SwitcherProps>(), {})

const emit = defineEmits(['update:modelValue'])

const switcher = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <label v-bind="props" class="switcher" :class="[props.size, { active: switcher }]">
    <span class="switcher__icon"></span>
    <input
      class="switcher__input"
      type="checkbox"
      v-model="switcher"
      :disabled="disabled"
    />
  </label>
</template>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

// Variables
$timeout: 0.25s;

.switcher {
  $parent: &;

  position: relative;
  border-radius: 20px;
  background-color: $gray-light-color;
  transition: all $timeout linear;

  &__icon {
    position: absolute;
    z-index: 9;

    background-color: $white-color;
    border-radius: 100%;

    transition: all $timeout linear;
  }

  //==State==
  &:hover {
    background-color: $gray-color;
    transition: all $timeout linear;
  }

  &:active {
    background-color: $gray-light-color;
    transition: all $timeout linear;

    &::before {
      background-color: rgba(215, 216, 223, 0.2);
      border-radius: 20px;
    }
  }

  &.active {
    background-color: $primary-color;
    &:active {
      &::before {
        background-color: $press-active-color;
      }
    }
  }

  &.disabled {
    cursor: not-allowed;
    background-color: $gray-extra-light-color;

    &:hover {
      background-color: $gray-extra-light-color !important;
    }
    &::before {
      background-color: transparent !important;
    }
  }

  //==Size==
  &.lg {
    width: 56px;
    height: 32px;

    #{$parent}__icon {
      top: 2px;
      left: 2px;
      @include size-box(28px);
    }
    &.active #{$parent}__icon {
      transform: translateX(24px);
    }
    &::before {
      left: -1.5px;
      top: -1.5px;
      @include size-box(calc(100% + 3px));
    }

    &::before {
      $indent: 8px;

      left: -4px;
      top: -4px;
      @include size-box(calc(100% + 8px));
    }
  }

  &.sm {
    &.switcher {
      width: 36px;
      height: 20px;

      #{$parent}__icon {
        top: 2px;
        left: 2px;
        @include size-box(16px);
      }
      &.active #{$parent}__icon {
        transform: translateX(16px);
      }
      &::before {
        $indent: 4px;

        left: -$indent;
        top: -$indent;
        @include size-box(calc(100% + ($indent * 2)));
      }
    }

    &::before {
      $indent: 8px;

      left: -$indent;
      top: -$indent;
      @include size-box(calc(100% + ($indent * 2)));
    }
  }

  &::before {
    content: '';
    position: absolute;
    z-index: -1;

    border-radius: 100%;
    transition: all $timeout linear;
  }

  &__input {
    display: none;
  }
}
</style>
