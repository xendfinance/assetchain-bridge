<script setup lang="ts">
import { computed } from 'vue'
import Card from '@/components/gotbit-ui-kit/GCard.vue'

export interface PopupProps {
  modelValue: boolean
  size: 'lg' | 'md' | 'sm'

  width?: string
  height?: string
  radius?: string
  color?: string
}

const props = defineProps<PopupProps>()
const emit = defineEmits(['update:modelValue'])

const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function closeBack(e: any): void {
  if (e.target.classList.contains('popup--fixed')) emit('update:modelValue', false)
}
</script>

<template>
  <Transition name="popup">
    <div class="popup--fixed" v-if="selected" @click="closeBack($event)">
      <Card
        class="popup"
        :class="props.size"
        :radius="props.radius"
        :width="props.width"
        :height="props.height"
        :color="'#fff' ?? props.color"
      >
        <slot></slot>
        <div class="popup--close" @click="emit('update:modelValue', false)">x</div>
      </Card>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

// Variables
$timeout: 0.15s;

.popup-enter-active,
.popup-leave-active {
  transition: all $timeout linear;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}

.popup {
  $parent: &;
  &--fixed {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 9999;

    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(16px);

    @include flex-center;
  }

  &--close {
    position: absolute;
    user-select: none;
    cursor: pointer;
  }

  position: relative;

  &.lg {
    padding: 48px;

    #{$parent}--close {
      $indent: 32px;

      top: $indent;
      right: $indent;
    }
  }
  &.md {
    padding: 40px;

    #{$parent}--close {
      $indent: 24px;

      top: $indent;
      right: $indent;
    }
  }
  &.sm {
    padding: 24px;

    #{$parent}--close {
      $indent: 20px;

      top: $indent;
      right: $indent;
    }
  }
}
</style>
