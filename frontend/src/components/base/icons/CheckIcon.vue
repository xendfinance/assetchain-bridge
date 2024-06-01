<template>
  <GIcon v-bind="props">
    <svg
      width="9"
      height="7"
      viewBox="0 0 9 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2.93254 5.2471L1.28033 3.70504C0.987435 3.43167 0.512562 3.43167 0.219669 3.70504C-0.0732231 3.9784 -0.0732231 4.42162 0.219669 4.69498L2.46966 6.79497C2.7876 7.09171 3.31193 7.06246 3.58972 6.73247L8.83971 1.1325C9.09562 0.828512 9.03904 0.388455 8.71334 0.149606C8.38763 -0.0892421 7.91614 -0.0364353 7.66023 0.267554L2.93254 5.2471Z"
        fill="white"
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
