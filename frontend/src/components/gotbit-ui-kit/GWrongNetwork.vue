<template>
  <div class="relative flex">
    <WrongNetworkIcon
      class="cursor-pointer"
      :class="{ 'network-hover': !hover }"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      @touchstart="hover = !hover"
    />
    <div class="network-hint" :class="[props.position, { 'network-hint__hover': hover }]">
      Wrong network
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import WrongNetworkIcon from '@/components/gotbit-ui-kit/icons/WrongNetworkIcon.vue'
import type { Position } from '@/components/gotbit-ui-kit/types'

export interface WrongNetworkProps {
  position?: Position
}

const props = withDefaults(defineProps<WrongNetworkProps>(), { position: 'bottom' })

const hover = ref<boolean>(false)
</script>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

.network-hint {
  position: absolute;
  display: none;
  width: 110px;
  background-color: $gray-color;
  border-radius: 8px;
  padding: 12px;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: -0.14px;
  font-feature-settings:
    'pnum' on,
    'lnum' on;
  color: $white-color;

  z-index: 10;

  @include for-size(sm) {
    width: 130px;
    font-size: 14px;
  }

  &__hover {
    display: block;
  }

  &.right {
    left: 40px;
    top: -65%;

    &:before {
      content: '';
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-right: 8px solid $gray-color;
      left: -8px;
      top: calc(50% - 8px);
    }
  }

  &.bottom {
    right: -48px;
    top: 45px;

    &:before {
      content: '';
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 8px solid $gray-color;
      left: calc(100% - 68px);
      bottom: 100%;
    }
  }

  &.left {
    right: 40px;
    top: -65%;

    &:before {
      content: '';
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-left: 8px solid $gray-color;
      right: -8px;
      top: calc(50% - 8px);
    }
  }

  &.top {
    right: -48px;
    bottom: 45px;

    &:before {
      content: '';
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid $gray-color;
      left: calc(100% - 68px);
      top: 100%;
    }
  }
}
</style>
