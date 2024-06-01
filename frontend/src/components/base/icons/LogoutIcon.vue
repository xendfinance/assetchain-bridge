<template>
  <GIcon v-bind="props">
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.6016 16.44C15.2916 20.04 13.4416 21.51 9.39156 21.51L9.26156 21.51C4.79156 21.51 3.00156 19.72 3.00156 15.25L3.00156 8.73998C3.00156 4.26998 4.79156 2.47998 9.26156 2.47998L9.39156 2.47998C13.4116 2.47998 15.2616 3.92998 15.5916 7.46998"
        stroke="#9799A2"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9.49891 12L20.8789 12"
        stroke="#9799A2"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M18.65 15.3499L22 11.9999L18.65 8.6499"
        stroke="#9799A2"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
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
