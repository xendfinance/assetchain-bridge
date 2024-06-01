<template>
  <div class="relative">
    <picture>
      <!-- <source :srcset="`${props.path}.webp`" type="image/webp" /> -->
      <img class="h-full w-full object-cover" src="/weth.png" alt="Media picrute" />
    </picture>
  </div>
</template>

<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

interface CopyIconProps extends IconProps {}
const props = defineProps<CopyIconProps>()
</script>
