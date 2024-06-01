<template>
  <GIcon v-bind="props">
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24.459 39.5424L32.0014 32M32.0014 32L39.5438 24.4575M32.0014 32L24.459 24.4575M32.0014 32L39.5438 39.5424"
        stroke="#BC1409" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path
        d="M32.0002 58.6668C46.7276 58.6668 58.6668 46.7276 58.6668 32.0002C58.6668 17.2726 46.7276 5.3335 32.0002 5.3335C17.2726 5.3335 5.3335 17.2726 5.3335 32.0002C5.3335 46.7276 17.2726 58.6668 32.0002 58.6668Z"
        stroke="#BC1409" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </GIcon>
</template>

<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

interface CopyIconProps extends IconProps { }
const props = defineProps<CopyIconProps>()
</script>
