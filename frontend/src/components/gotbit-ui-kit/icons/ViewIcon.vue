<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

interface ViewwIconProps extends IconProps {}
const props = defineProps<ViewwIconProps>()
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
        d="M18 11.25V17.25C18 19.3177 16.3177 21 14.25 21L6.75 21C4.68225 21 3 19.3177 3 17.25L3 9.75C3 7.68225 4.68225 6 6.75 6L12.75 6C13.164 6 13.5 6.336 13.5 6.75C13.5 7.164 13.164 7.5 12.75 7.5L6.75 7.5C5.5095 7.5 4.5 8.5095 4.5 9.75L4.5 17.25C4.5 18.4905 5.5095 19.5 6.75 19.5L14.25 19.5C15.4905 19.5 16.5 18.4905 16.5 17.25V11.25C16.5 10.836 16.836 10.5 17.25 10.5C17.664 10.5 18 10.836 18 11.25ZM18.75 3L13.5 3C13.086 3 12.75 3.336 12.75 3.75C12.75 4.164 13.086 4.5 13.5 4.5L18.4395 4.5L9.21975 13.7198C8.9265 14.013 8.9265 14.487 9.21975 14.7802C9.366 14.9265 9.558 15 9.75 15C9.942 15 10.134 14.9265 10.2802 14.7802L19.5 5.5605V10.5C19.5 10.914 19.836 11.25 20.25 11.25C20.664 11.25 21 10.914 21 10.5V5.25C21 4.0095 19.9905 3 18.75 3Z"
        fill="#404042"
      />
    </svg>
  </GIcon>
</template>
