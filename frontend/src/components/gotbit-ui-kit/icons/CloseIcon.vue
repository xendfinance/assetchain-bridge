<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

interface CloseIconProps extends IconProps {}

const props = defineProps<CloseIconProps>()
</script>

<template>
  <GIcon v-bind="props">
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.29079 8.29104C8.68031 7.90151 9.31347 7.90313 9.705 8.29465L21.7052 20.2947C22.0967 20.6862 22.0983 21.3194 21.7088 21.7089C21.3193 22.0984 20.6861 22.0968 20.2946 21.7053L8.29442 9.70525C7.9029 9.31372 7.90127 8.68056 8.29079 8.29104Z"
        :fill="props.color"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.2947 21.7053C7.90318 21.3138 7.90156 20.6806 8.29108 20.2911L20.2911 8.29109C20.6806 7.90156 21.3138 7.90319 21.7053 8.29471C22.0968 8.68624 22.0984 9.3194 21.7089 9.70892L9.70891 21.7089C9.31939 22.0984 8.68623 22.0968 8.2947 21.7053Z"
        :fill="props.color"
      />
    </svg>
  </GIcon>
</template>
