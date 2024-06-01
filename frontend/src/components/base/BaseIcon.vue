<template>
  <div v-html="path" class="icon-item" ref="icon"></div>
</template>

<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue'
import icons from '@/misc/svgs'

export type Icon = keyof typeof icons

export interface IconProps {
  name: Icon
  size?: string
  color?: string
}

const props = defineProps<IconProps>()

const path = ref<string>('')
const icon = ref(null)

onMounted(() => {
  try {
    const svg = icon.value as any
    path.value = icons[props.name]
    if (props.size) {
      svg.firstChild.setAttribute('width', props.size)
      svg.firstChild.setAttribute('height', props.size)
    }
    if (props.color) {
      Array.from(svg.firstChild.children).forEach((c: any) =>
        c.setAttribute('fill', props.color),
      )
      Array.from(svg.firstChild.children).forEach((c: any) =>
        c.setAttribute('stroke', props.color),
      )
    }
  } catch (e) {}
})
onUpdated(() => {
  try {
    const svg = icon.value as any
    path.value = icons[props.name]
    if (props.size) {
      svg.firstChild.setAttribute('width', props.size)
      svg.firstChild.setAttribute('height', props.size)
    }
    if (props.color) {
      Array.from(svg.firstChild.children).forEach((c: any) =>
        c.setAttribute('fill', props.color),
      )
    }
  } catch (e) {}
})
</script>
