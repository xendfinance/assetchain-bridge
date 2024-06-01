<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

interface DoneIconProps extends IconProps {}
const props = defineProps<DoneIconProps>()
</script>

<template>
  <GIcon v-bind="props">
    <svg viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18.5 8L10.5 16"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.5 12L10.5 16"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </GIcon>
</template>
