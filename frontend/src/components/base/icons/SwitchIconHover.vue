<template>
  <GIcon v-bind="props">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.6667 13L17 16.5M17 16.5L13.6667 20M17 16.5L7 16.5"
        stroke="#F5C17C"
        stroke-width="1.3"
      />
      <path
        d="M10.3333 12L7 8.5M7 8.5L10.3333 5M7 8.5L17 8.5"
        stroke="#F5C17C"
        stroke-width="1.3"
      />
    </svg>
  </GIcon>
</template>

<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

interface CopyIconProps extends IconProps {}
const props = defineProps<CopyIconProps>()
</script>
