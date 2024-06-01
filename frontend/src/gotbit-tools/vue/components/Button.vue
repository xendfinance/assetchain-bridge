<template>
  <button
    class="w-[100px] bg-blue-300 rounded-md shadow-md text-white"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits(['click'])
</script>
