<template>
  <GIcon v-bind="props">
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.90625 12.76L15.9996 4.66668L24.0929 12.76"
        stroke="#007CFF"
        stroke-width="2"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M16 27.3333L16 4.89325"
        stroke="#007CFF"
        stroke-width="2"
        stroke-miterlimit="10"
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
