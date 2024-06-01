<template>
  <GIcon v-bind="props">
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.8277 13.6667L8.33243 17M8.33243 17L4.83718 13.6667M8.33243 17L8.33243 7"
        :stroke="props.color"
        stroke-width="1.3"
      />
      <path
        d="M12.8263 10.3333L16.3216 7M16.3216 7L19.8168 10.3333M16.3216 7L16.3216 17"
        :stroke="props.color"
        stroke-width="1.3"
      />
    </svg>
  </GIcon>
</template>

<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

// interface CopyIconProps extends IconProps {}
// const props = defineProps<CopyIconProps>()

export interface IconPropsType {
  color: string
}

const props = defineProps<IconPropsType>()
</script>
