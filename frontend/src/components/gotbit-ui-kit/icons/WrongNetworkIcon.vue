<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

interface WrongNetworkIconProps extends IconProps {}

const props = defineProps<WrongNetworkIconProps>()
</script>

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
        d="M12.0001 9.32607V12.884M19.2058 20H4.79435C3.41646 20 2.55461 18.5199 3.24086 17.3342L10.4466 4.89194C11.1364 3.70269 12.8646 3.70269 13.5535 4.89194L20.7593 17.3342C21.4455 18.5199 20.5828 20 19.2058 20Z"
        stroke="#EB5757"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M12 16.001L12.01 16"
        stroke="#EB5757"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </GIcon>
</template>
