<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

interface ListIconProps extends IconProps {}
const props = defineProps<ListIconProps>()
</script>

<template>
  <GIcon v-bind="props">
    <svg viewBox="0 0 12 7" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L5.29289 6.70711C5.68342 7.09763 6.31658 7.09763 6.70711 6.70711L11.7071 1.70711C12.0976 1.31658 12.0976 0.683417 11.7071 0.292893C11.3166 -0.0976311 10.6834 -0.0976311 10.2929 0.292893L6 4.58579L1.70711 0.292893Z"
      />
    </svg>
  </GIcon>
</template>
