<template>
  <GIcon v-bind="props">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 14L12 9L17 14" stroke="#505050" stroke-width="1.5" />
    </svg>
  </GIcon>
</template>

<script setup lang="ts">
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'

interface CopyIconProps extends IconProps {}
const props = defineProps<CopyIconProps>()
</script>
