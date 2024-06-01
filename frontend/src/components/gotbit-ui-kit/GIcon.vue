<template>
  <div ref="icon"><slot /></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

export interface IconProps {
  size?: string
  color?: string
  stroke?: string
  transform?: string
}

const props = defineProps<IconProps>()
const icon = ref(null)

onMounted(() => {
  try {
    const svg = icon.value as any

    if (props.size) {
      svg.children[0].setAttribute('width', props.size)
      svg.children[0].setAttribute('height', props.size)
    }
    if (props.color) {
      svg.children[0].setAttribute('fill', props.color)
    }
    if (props.stroke) {
      Array.from(svg.children[0].children).forEach((child: any) =>
        child.setAttribute('stroke', props.stroke),
      )
    }
    if (props.transform) {
      svg.children[0].setAttribute('transform', props.transform)
    }
  } catch (e) {
    console.error(e)
  }
})
</script>

<style lang="scss"></style>
