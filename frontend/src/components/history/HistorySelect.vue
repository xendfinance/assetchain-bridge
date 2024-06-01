<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

import GCard from '@/components/gotbit-ui-kit/GCard.vue'
import ArrowDown from '@/components/gotbit-ui-kit/icons/ArrowDownIcon.vue'
import ArrowUp from '@/components/gotbit-ui-kit/icons/ArrowUpIcon.vue'

export interface ISelectorOptions {
  value: string | number
  label: string
  component: any
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

const iconsMainLabel = computed(
  () => props.options.filter((o) => o.value === props.modelValue)[0].component,
)

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
    <GCard class="flex flex-col select-none main-body z-[10]">
      <div
        class="flex justify-between items-center text-main-text h-[15px]"
        @click="active = !active"
        ref="dropdown"
      >
        <div class="flex items-center gap-[12px]">
          <div class="flex mr-[20px]">
            <component
              v-for="icon of iconsMainLabel"
              :is="icon"
              class="w-[29px] h-[29px] mr-[-15px]"
            />
          </div>
          <div>{{ mainLabel }}</div>
        </div>
        <ArrowUp v-if="active" />
        <ArrowDown v-else />
      </div>
    </GCard>
    <div
      class="absolute top-[22px] border-[1px] border-main-text space-y-[16px] dropdown-body z-[1]"
      v-if="active"
    >
      <div
        class="cursor-pointer flex items-center gap-[6px] hover:on-hover"
        :class="{ 'not-active': mainLabel !== option.label }"
        v-for="option of props.options"
        :key="option.value"
        @click="() => onSelect(option.value)"
      >
        <div class="flex mr-[20px]">
          <component
            v-for="icon of option.component"
            :is="icon"
            class="w-[29px] h-[29px] mr-[-15px]"
          />
        </div>
        <div class="text-[12px]">{{ option.label }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

.main-body {
  border-radius: 52px;
  padding: 14px 16px 14px 16px;
  background-color: #3a114a;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: -0.5px;
}

.dropdown-body {
  width: 100%;
  padding: 30px 16px 16px 16px;
  background: $main-card;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: -0.5px;
  box-shadow: 0px 20px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid #8b42aa;
  border-radius: 8px 8px 28px 28px;
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
