<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

import TooltipIcon from '@/components/gotbit-ui-kit/icons/TooltipIcon.vue'

import type { Position } from '@/components/gotbit-ui-kit/types'

export interface TooltipProps {
  position?: Position
  hint: string
  size?: number
}

const props = withDefaults(defineProps<TooltipProps>(), {
  position: 'right',
  size: 20,
})

const hover = ref<boolean>(false)
const windowWidth = ref<number>(window.innerWidth)
const onWidthChange = () => (windowWidth.value = window.innerWidth)

const tooltipPosition = computed((): Position => {
  if (windowWidth.value < 1024) return 'bottom'
  else return props.position
})

const widthTooltip = ref(288)

function translateXTooltip(): string {
  switch (tooltipPosition.value) {
    case 'left':
      return 'translateX(-' + (props.size + 8) + 'px)'
    case 'right':
      return 'translateX(' + (props.size + 8) + 'px)'
    case 'top':
      return (
        'translateY(-' +
        (props.size + 8) +
        'px) translateX(' +
        (52 - (props.size - 16) / 2) + // (отступ триугольника справа - ширина триугольника = 52)
        'px)'
      )
    case 'bottom':
      return (
        'translateY(' +
        (props.size + 8) +
        'px) translateX(' +
        (52 - (props.size - 16) / 2) +
        'px)'
      )
  }
}

onMounted(() => window.addEventListener('resize', onWidthChange))
onUnmounted(() => window.removeEventListener('resize', onWidthChange))
</script>

<template>
  <div class="tooltip">
    <TooltipIcon
      class="tooltip__icon"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      color="#191a1b"
      :size="size + 'px'"
    />
    <Transition name="tooltip--visible">
      <div
        class="tooltip__hint text-primary"
        v-if="hover"
        :class="tooltipPosition"
        :style="{ transform: translateXTooltip(), width: widthTooltip + 'px' }"
      >
        {{ hint }}
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

$timeout: 0.35s;

.tooltip--visible-enter-active {
  animation: tooltip-in $timeout;
}
.tooltip--visible-leave-active {
  animation: tooltip-in $timeout reverse;
}
@keyframes tooltip-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.tooltip {
  position: relative;
  display: flex;

  opacity: 0.45;
  transition: opacity linear $timeout;

  &:hover {
    opacity: 1;
    transition: opacity linear $timeout;
  }

  &__icon {
    cursor: pointer;
  }

  &__hint {
    position: absolute;
    z-index: 10;

    padding: 12px;
    line-height: 20px;

    background-color: $black-color;
    color: #0ed89e !important;
    border-radius: 8px;

    font: {
      size: 14px;
      feature-settings:
        'pnum' on,
        'lnum' on;
    }

    &.right {
      top: 50%;
      translate: 0 -50%;
      left: 0;

      &:before {
        content: '';
        position: absolute;
        display: block;
        width: 0;
        height: 0;
        left: -8px;
        top: calc(50% - 8px);

        border: 8px solid transparent {
          left: unset;
          right-color: $black-color;
        }
      }
    }

    &.bottom {
      right: 0;
      top: 0;

      &:before {
        content: '';
        position: absolute;
        display: block;
        width: 0;
        height: 0;
        left: calc(100% - 68px);
        bottom: 100%;

        border: 8px solid transparent {
          top: unset;
          bottom-color: $black-color;
        }
      }
    }

    &.left {
      top: 50%;
      translate: 0 -50%;
      right: 0;

      &:before {
        content: '';
        position: absolute;
        display: block;
        width: 0;
        height: 0;
        right: -8px;
        top: calc(50% - 8px);

        border: 8px solid transparent {
          right: unset;
          left-color: $black-color;
        }
      }
    }

    &.top {
      right: 0;
      bottom: 0;

      &:before {
        content: '';
        position: absolute;
        display: block;
        width: 0;
        height: 0;
        left: calc(100% - 68px);
        top: 100%;

        border: 8px solid transparent {
          bottom: unset;
          top-color: $black-color;
        }
      }
    }
  }
}
</style>
