<template>
  <GIcon v-bind="props">
    <svg
      width="24"
      height="23"
      viewBox="0 0 29 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.82566 14L3.66681 17.158L0.5 14L3.65885 10.842L6.82566 14ZM14.504 6.32386L19.9226 11.7409L23.0814 8.58295L14.504 0L5.91858 8.58295L9.07744 11.7409L14.504 6.32386ZM25.3411 10.842L22.1823 14L25.3411 17.158L28.5 14L25.3411 10.842ZM14.504 21.6761L9.08539 16.2591L5.92654 19.417L14.504 28L23.0814 19.417L19.9226 16.2591L14.504 21.6761ZM14.504 17.158L17.6628 14L14.504 10.842L11.3372 14L14.504 17.158Z"
        fill="#F0B90B"
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
