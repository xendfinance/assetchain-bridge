<template>
  <div v-auto-animate class="w-full border-b border-[#ffffff10] pb-6 md:pb-8">
    <button
      v-auto-animate
      class="flex items-center w-full justify-between pt-6 border-none outline-none"
      @click="isOpen = !isOpen"
    >
      <p class="uppercase font-semibold text-[14px] md:text-xl text-start text-label-text">
        {{ props.title }}
      </p>
      <PlusCircle v-if="!isOpen" />
      <MinusCircle v-else />
    </button>
    <p
      v-if="isOpen"
      class="w-full text-sm md:text-[15px] pt-6 whitespace-pre-wrap text-left text-label-text"
    >
      {{ props.text }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import PlusCircle from '@/components/base/icons/PlusCircle.vue'
import MinusCircle from '@/components/base/icons/MinusCircle.vue'

interface FaqCard {
  title: string
  text: string
}

const props = defineProps<FaqCard>()

const isOpen = ref(false)
</script>

<style lang="scss" scoped></style>
