<template>
  <div v-if="web3.globalLoading" class="custom-dialog">
    <div class="gradient-border">
      <GLoader />
    </div>
  </div>
</template>

<script setup lang="ts">
import GLoader from '@/components/gotbit-ui-kit/GLoader.vue'

import { useWeb3 } from '@/gotbit-tools/vue'

const web3 = useWeb3()
</script>

<style scoped lang="scss">
@import '@/assets/config.scss';

.custom-dialog {
  position: fixed;
  top: -50px;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
}

.gradient-border {
  position: fixed;
  top: 53%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  z-index: 0;
}
</style>
