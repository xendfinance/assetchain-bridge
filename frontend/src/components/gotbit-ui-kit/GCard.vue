<script setup lang="ts">
import { ref, onMounted } from 'vue'

export interface CardProps {
  color?: string
  radius?: string
  border?: string

  width?: string
  height?: string
}

const props = withDefaults(defineProps<CardProps>(), {})
const card = ref<HTMLDivElement>()

onMounted(() => {
  try {
    const tag = card.value
    if (!tag) return

    tag.style.borderRadius = props.radius ?? tag.style.borderRadius
    tag.style.border = props.border ?? tag.style.border
    tag.style.backgroundColor = props.color ?? tag.style.backgroundColor
    tag.style.width = props.width ?? tag.style.width
    tag.style.height = props.height ?? tag.style.height
  } catch (e) {
    console.error(e)
  }
})
</script>

<template>
  <div
    class="bg-primary-card rounded-[16px] px-[20px] md:px-[44px] py-[24px] md:py-[36px]"
    ref="card"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped></style>
