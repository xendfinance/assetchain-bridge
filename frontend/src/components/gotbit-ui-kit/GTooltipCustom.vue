<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useMedia } from '@/composables'

import TooltipIcon from '@/components/gotbit-ui-kit/icons/TooltipIcon.vue'
import type { Position } from '@/components/gotbit-ui-kit/types'
import { onClickOutside } from '@vueuse/core'

export interface TooltipProps {
  position?: Position
  hint: string
  size?: number
  text?: boolean
}

const props = withDefaults(defineProps<TooltipProps>(), {
  position: 'right',
  size: 16,
})

const hover = ref<boolean>(false)
const windowWidth = ref<number>(window.innerWidth)
const { sm } = useMedia()

const tooltip = ref<HTMLElement | any>(null)
onClickOutside(tooltip, () => (hover.value = false))

const onWidthChange = () => (windowWidth.value = window.innerWidth)

function translateXTooltip(): string {
  switch (props.position) {
    case 'left':
      return 'translateX(-' + (props.size + 16) + 'px)'
    case 'right':
      return 'translateX(' + (props.size + 16) + 'px)'
    case 'top':
      return 'translateY(-' + (props.size + 14) + 'px)'
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
    <div class="hidden lg:block">
      <span
        v-if="props.text"
        class="outline-none border-none"
        @mouseenter="hover = true"
        @mouseleave="hover = false"
      >
        <slot />
      </span>
      <TooltipIcon
        v-else
        class="cursor-pointer"
        @mouseenter="hover = true"
        @mouseleave="hover = false"
        color="#007CFF80"
      />
    </div>
    <div class="block lg:hidden">
      <button v-if="props.text" class="outline-none border-none" @click="hover = !hover">
        <slot />
      </button>
      <TooltipIcon
        v-else
        class="cursor-pointer"
        @click="hover = !hover"
        color="#007CFF80"
      />
    </div>

    <Transition name="tooltip--visible">
      <div
        class="tooltip__hint text-xs text-center w-full"
        ref="tooltip"
        v-if="hover"
        :class="props.position"
        :style="{
          transform: translateXTooltip(),
          width: text ? '144px' : '260pxs',
          left: position === 'top' ? (text ? (sm ? '-60px' : '-95px') : '-130px') : '',
        }"
      >
        <span
          :class="{ 'text-base': text }"
          class="whitespace-pre-wrap break-words text-primary"
          >{{ hint }}</span
        >
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

  &__hint {
    position: absolute;
    z-index: 10;
    padding: 8px 16px;
    background: #ffffff06;
    backdrop-filter: blur(3px);
    color: #2aa0f8;
    font-weight: 400;
    font-size: 11px;
    border-radius: 8px;

    &.right {
      top: 50%;
      translate: 0 -50%;
      left: 38px;

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
          right-color: #ffffff06;
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
          bottom-color: #ffffff06;
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
          left-color: #ffffff06;
        }
      }
    }

    &.top {
      bottom: 4px;

      &:before {
        content: '';
        position: absolute;
        display: block;
        width: 0;
        height: 0;
        left: 50%;
        top: 100%;
        border: 8px solid transparent {
          bottom: unset;
          top-color: #ffffff06;
        }
      }
    }
  }
}
</style>
