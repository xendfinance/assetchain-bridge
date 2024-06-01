<template>
  <div>
    <!-- <BaseIcon class="ml-[75%] md:ml-[70%]" name="hat" :size="props.size" /> -->
    <BaseCard class="bg-primary-card w-full" dropdown :menu="props.menu">
      <slot></slot
    ></BaseCard>
  </div>
</template>

<script setup lang="ts">
import BaseCard from '@/components/gotbit-ui-kit/GCard.vue'
// import BaseIcon from '@/components/base/BaseIcon.vue'

export interface DropdownProps {
  size?: string
  menu?: boolean
}
const props = defineProps<DropdownProps>()
</script>
