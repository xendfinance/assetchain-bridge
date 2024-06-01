<template>
  <GIcon v-bind="props">
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.16797 7.3333L14.6346 1.86664"
        stroke="#007CFF"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.1648 4.53331V1.33331H11.9648"
        stroke="#007CFF"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M7.83203 1.33331H6.4987C3.16536 1.33331 1.83203 2.66665 1.83203 5.99998V9.99998C1.83203 13.3333 3.16536 14.6666 6.4987 14.6666H10.4987C13.832 14.6666 15.1654 13.3333 15.1654 9.99998V8.66665"
        stroke="#007CFF"
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
