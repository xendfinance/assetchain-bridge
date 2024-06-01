<template>
  <div>
    <KeyHandler />
    <RouterView />
    <BaseDialog />
    <!-- <LoaderScreen /> -->
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useWeb3, KeyHandler } from '@/gotbit-tools/vue'
import LoaderScreen from '@/components/base/LoaderScreen.vue'

import BaseDialog from '@/components/base/Dialog.vue'

useWeb3().init()
</script>

<style lang="scss"></style>
