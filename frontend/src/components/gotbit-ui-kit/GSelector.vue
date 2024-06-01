<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

import GCard from '@/components/gotbit-ui-kit/GCard.vue'
import ArrowDown from '@/components/gotbit-ui-kit/icons/ArrowDownIcon.vue'
import ArrowUp from '@/components/gotbit-ui-kit/icons/ArrowUpIcon.vue'

export interface ISelectorOptions {
  value: string | number
  label: string
}

export interface SelectorProps {
  options: ISelectorOptions[]
  modelValue?: string | number
  dropdownWidth?: string
}

const emit = defineEmits(['update:modelValue', 'press'])
const props = defineProps<SelectorProps>()

const active = ref(false)
const dropdown = ref<HTMLElement>()
const mainLabel = ref('')

onClickOutside(dropdown, () => {
  active.value = false
})

onMounted(() => {
  mainLabel.value = props.options.filter(
    (option) => option.value === props.modelValue,
  )[0].label
})

function onSelect(value: string | number) {
  emit('update:modelValue', value)
  emit('press')
  mainLabel.value = props.options.filter((option) => option.value === value)[0].label
}
</script>

<template>
  <div class="flex flex-col relative" :class="{ activeDrop: active }">
    <GCard class="flex flex-col select-none main-body">
      <div class="flex justify-between" @click="active = !active" ref="dropdown">
        <!-- {{ mainLabel }} Round -->
        {{ mainLabel }}
        <ArrowUp v-if="active" />
        <ArrowDown v-else />
      </div>
    </GCard>
    <div
      class="absolute top-[35px] space-y-[16px] dropdown-body z-[1] rounded-b-[12px]"
      v-if="active"
    >
      <div
        class="cursor-pointer items-center justify-start hover:on-hover"
        :class="{ 'not-active': mainLabel !== option.label }"
        v-for="option of props.options"
        :key="option.value"
        @click="() => onSelect(option.value)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

.main-body {
  border-radius: 12px;
  padding: 14px 16px 14px 16px;
  background-color: white;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: -0.5px;
  box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.06);
}

.dropdown-body {
  width: 100%;
  padding: 16px 16px 16px 16px;
  background-color: white;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: -0.5px;
  box-shadow: 0px 20px 30px rgba(0, 0, 0, 0.06);
}

.not-active {
  color: #9799a1;
}
.on-hover {
  font-weight: 500;
  font-size: 18px;
  line-height: 18px;
  color: #000000;
}
</style>
