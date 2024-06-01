<script setup lang="ts">
import type { IconProps } from '@/components/gotbit-ui-kit/GIcon.vue'
import GIcon from '@/components/gotbit-ui-kit/GIcon.vue'

interface CoinbaseIconProps extends IconProps {}

const props = defineProps<CoinbaseIconProps>()
</script>

<template>
  <!-- <GIcon v-bind="props">
    
  </GIcon> -->
  <div class="relative">
    <picture>
      <!-- <source :srcset="`${props.path}.webp`" type="image/webp" /> -->
      <img
        class="h-full w-full object-cover"
        src="/wnt.png"
        alt="Media picrute"
      />
    </picture>
  </div>
</template>
