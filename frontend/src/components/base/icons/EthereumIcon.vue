<template>
  <GIcon v-bind="props">
    <svg
      width="24"
      height="23"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_11_1588)">
        <path
          d="M13.9974 0L13.8096 0.638082V19.1521L13.9974 19.3395L22.5913 14.2596L13.9974 0Z"
          fill="#343434"
        />
        <path d="M13.9974 0L5.40332 14.2596L13.9974 19.3395V10.3533V0Z" fill="#8C8C8C" />
        <path
          d="M13.9975 20.9666L13.8916 21.0957V27.6907L13.9975 27.9998L22.5966 15.8894L13.9975 20.9666Z"
          fill="#3C3C3B"
        />
        <path
          d="M13.9974 27.9998V20.9666L5.40332 15.8894L13.9974 27.9998Z"
          fill="#8C8C8C"
        />
        <path
          d="M13.9971 19.3395L22.5909 14.2596L13.9971 10.3533V19.3395Z"
          fill="#141414"
        />
        <path
          d="M5.40332 14.2596L13.9974 19.3395V10.3533L5.40332 14.2596Z"
          fill="#393939"
        />
      </g>
      <defs>
        <clipPath id="clip0_11_1588">
          <rect width="28" height="28" fill="white" />
        </clipPath>
      </defs>
    </svg>
  </GIcon>
</template>

<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

interface CopyIconProps extends IconProps {}
const props = defineProps<CopyIconProps>()
</script>
