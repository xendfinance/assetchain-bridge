<script setup lang="ts">
import LoaderIcon from '@/components/base/icons/LoaderIcon.vue'

export interface LoaderProps {
  color?: string
  size?: string
  border?: string
}

const props = defineProps<LoaderProps>()

const styleSize = {
  width: `${props.size} !important`,
  height: `${props.size} !important`,
}
</script>

<template>
  <LoaderIcon class="loader" :style="styleSize" />
</template>

<style scoped lang="scss">
@import '@/components/gotbit-ui-kit/assets/config.scss';

.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  margin: 10px auto;
  margin-top: 35px;
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
