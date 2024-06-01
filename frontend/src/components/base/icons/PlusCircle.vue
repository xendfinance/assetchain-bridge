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
        d="M12.7499 11.2501V8.81802C12.7499 8.4033 12.4147 8.06813 12 8.06813C11.5853 8.06813 11.2501 8.4033 11.2501 8.81802V11.2501H8.818C8.40329 11.2501 8.06812 11.5853 8.06812 12C8.06812 12.4147 8.40329 12.7499 8.818 12.7499H11.2501V15.182C11.2501 15.5967 11.5853 15.9319 12 15.9319C12.2068 15.9319 12.3946 15.8481 12.5303 15.7123C12.6661 15.5765 12.7499 15.3888 12.7499 15.182V12.7499L15.182 12.7499C15.3888 12.7499 15.5765 12.6661 15.7123 12.5303C15.8481 12.3946 15.9319 12.2068 15.9319 12C15.9319 11.5853 15.5967 11.2501 15.182 11.2501L12.7499 11.2501Z"
        fill="#2042B8"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 21C16.9627 21 21 16.9627 21 12C21 7.03725 16.9627 3 12 3C7.03725 3 3 7.03725 3 12C3 16.9627 7.03725 21 12 21ZM12 4.5C16.1355 4.5 19.5 7.8645 19.5 12C19.5 16.1355 16.1355 19.5 12 19.5C7.8645 19.5 4.5 16.1355 4.5 12C4.5 7.8645 7.8645 4.5 12 4.5Z"
        fill="#2042B8"
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
