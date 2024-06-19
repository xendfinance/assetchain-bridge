<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ButtonHTMLAttributes } from 'vue'
import type { Size, State } from '@/components/gotbit-ui-kit/types'

import LoaderIcon from '@/components/gotbit-ui-kit/icons/LoaderIcon.vue'
import DoneIcon from '@/components/gotbit-ui-kit/icons/DoneIcon.vue'

export interface ButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  size?: Size
  state?: State
  disabled?: boolean
  primary?: boolean
  secondary?: boolean
  outline?: boolean
  width?: String
}

const props = withDefaults(defineProps<ButtonProps>(), {})

const emit = defineEmits(['click'])
const button = ref<HTMLElement | null>(null)

onMounted(() => {
  try {
    const tag = button.value as any

    if (props.width) {
      tag.style.width = props.width
    }
  } catch (e) {
    console.error(e)
  }
})
</script>

<template>
  <button
    v-bind="props"
    :class="[
      {
        ...props,
      },
      props.size,
      props.state,
    ]"
    @click="emit('click')"
  >
    <slot name="prefix-icon"></slot>
    <slot></slot>
    <slot name="suffix-icon"></slot>

    <LoaderIcon
      v-if="state == 'loader'"
      class="icon__fill"
      size="20"
      stroke="#fff"
      transform="scale(1.2)"
    />
    <DoneIcon v-if="state == 'done'" class="icon__fill" size="20" stroke="#fff" />
  </button>
</template>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

$timeout: 0.25s;

button {
  font-size: 16px;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  height: 48px;

  border-radius: 32px;
  // &:hover {
  //   background: #744852;
  // }
  // &:active {
  //   background: #42161f;
  // }

  transition: all linear $timeout;

  &.primary {
    background-color: #2042b8;
    color: #ffffff;
    border: 0;

    &:hover {
      background-color: #2042b870;
    }

    &:active {
      background-color: #2042b850;
      border-color: transparent;
    }

    &.disabled {
      // &:hover {
      //   background-color: #2042B8;
      //   opacity: 0.3;
      // }
      opacity: 0.3;
      background-color: #2042b8;
    }
  }

  &.secondary {
    background-color: #070e17;
    color: #ffffff;
    border: 1.5px solid #1e2643;
    border-radius: 32px;
    &:hover {
      background-color: #2042b870;
      border: 1.5px solid #1e2643;
    }

    &:active {
      background-color: #2042b870;
      border: solid 1.5px #1e2643;
    }
  }

  &.outline {
    background-color: #070e17;
    border: solid 1.5px #2042b8;
    color: white;

    &:hover {
      background-color: #2042b870;
    }

    &:active {
      background-color: #2042b850;
      border: solid 1.5px #2042b8;
    }
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.loader {
    cursor: wait;
  }

  //==Size==
  &.lg {
    gap: 10.5px;
    padding: 22px 52px;
    line-height: 28px;
    font-size: 20px;

    &.outline {
      border-width: 3px;
    }
  }

  &.md {
    width: 194px;

    &.outline {
      border-width: 2px;
    }
  }

  &.sm {
    height: 40px;
    width: 115px;

    &.outline {
      border-width: 2px;
    }
  }
}
</style>
