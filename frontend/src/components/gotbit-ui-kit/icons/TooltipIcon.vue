<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

interface ToolTipIconProps extends IconProps {}

const props = defineProps<ToolTipIconProps>()
</script>

<template>
  <GIcon v-bind="props">
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_56_745)">
        <path
          d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
        />
        <circle cx="8" cy="12.5" r="0.75" fill="white" />
        <path
          d="M8.875 9.63973C10.3846 9.2512 11.5 7.88086 11.5 6.25C11.5 4.317 9.933 2.75 8 2.75C6.067 2.75 4.5 4.317 4.5 6.25C4.5 6.25 4.5 7.125 5.375 7.125C6.25 7.125 6.25 6.25 6.25 6.25C6.25 5.2835 7.0335 4.5 8 4.5C8.9665 4.5 9.75 5.2835 9.75 6.25C9.75 7.2165 8.9665 8 8 8C7.51675 8 7.125 8.39175 7.125 8.875V9.75C7.125 10.2332 7.51675 10.625 8 10.625C8.48325 10.625 8.875 10.2332 8.875 9.75V9.63973Z"
          fill="white"
          stroke-width="0.25"
        />
      </g>
      <defs>
        <clipPath id="clip0_56_745">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  </GIcon>
</template>
