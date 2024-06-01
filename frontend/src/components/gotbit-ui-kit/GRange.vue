<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { InputHTMLAttributes } from 'vue'
import type { Size } from '@/components/gotbit-ui-kit/types'

export interface ButtonProps extends InputHTMLAttributes {
  size?: Size

  // color?: string;
  width?: string

  minRange?: number
  maxRange?: number
  step?: number
  modelValue?: number
  unit?: string

  minmax?: boolean
  minmaxColor?: string

  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  minRange: 0,
  maxRange: 100,
  step: 1,
  unit: '%',
})
const emit = defineEmits(['update:modelValue'])

const range = ref(0)
const indent = ref(0)
const widthProgressBar = ref('')

onMounted(() => {
  range.value = props.modelValue ?? 0
})

watch(range, (rangeNew) => {
  indent.value = (rangeNew * 100) / props.maxRange

  if (indent.value == 0) widthProgressBar.value = '0'
  if (indent.value < 65 && indent.value != 0)
    widthProgressBar.value = indent.value + '.3%'
  if (indent.value >= 65 && indent.value != 0)
    widthProgressBar.value = indent.value - 1 + '%'

  emit('update:modelValue', Number(rangeNew))
})
</script>

<template>
  <div
    class="range__container"
    :class="{ disabled: props.disabled, size }"
    :style="width ? 'width:' + width : ''"
  >
    <div
      class="range__minrange"
      v-if="props.minmax"
      :style="props.minmax ? 'color:' + props.minmaxColor : ''"
    >
      {{ props.minRange }}
    </div>
    <input
      class="range"
      type="range"
      v-model="range"
      :min="props.minRange"
      :max="props.maxRange"
      :step="props.step"
      :disabled="props.disabled"
    />
    <div class="range__progress" :style="{ width: widthProgressBar }"></div>
    <div
      class="range__option"
      :style="{
        left: indent + '%',
        transform: 'translateX(-' + indent + '%)',
      }"
    >
      <div class="range__button"></div>
      <div class="range__value" v-if="!props.disabled">{{ range }} {{ unit }}</div>
    </div>
    <div
      class="range__maxrange"
      v-if="props.minmax"
      :style="props.minmax ? 'color:' + props.minmaxColor + ';' : ''"
    >
      {{ props.maxRange }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

// Variables
$timeout: 0.3s;
$size-button: 20px;
$height-range: 8px;
$border-radius: 12px;

.range {
  position: relative;
  z-index: 11;

  -webkit-appearance: none;
  outline: none;
  user-select: none;

  width: 100%;
  height: $height-range;
  background-color: transparent;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;

    position: relative;
    z-index: 3;

    @include size-box($size-button);
    cursor: pointer;
  }

  &__container {
    position: relative;

    &:after {
      content: '';
      position: absolute;
      left: 0;
      height: 8px;
      z-index: -1;

      width: 100%;
      bottom: 4px;
      background-color: $gray-light-color;
      border-radius: $border-radius;
    }
  }

  &__minrange,
  &__maxrange {
    position: absolute;
    bottom: -24px;
  }

  &__minrange {
    left: 0;
  }
  &__maxrange {
    right: 0;
  }

  &__option {
    position: absolute;
    left: 50%;
    bottom: -2px;
    transform: translateX(-50%);
    z-index: 2;

    width: $size-button;
    height: 52px;
  }

  &__progress {
    position: absolute;
    left: 0;
    bottom: 4px;

    width: 0;
    height: $height-range;
    background-color: $primary-color;
    border-radius: $border-radius 0 0 $border-radius;
  }

  &__button {
    position: absolute;
    bottom: 0;

    @include size-box($size-button);
    background-color: $white-color;
    border: solid 1px $primary-color {
      radius: 50%;
    }

    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    -khtml-border-radius: 50%;
  }

  &__value {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);

    width: max-content;
    height: 24px;
    line-height: 20px;
    padding: 2px 8px;

    color: $primary-color;
    text-align: center;
    font: {
      size: 12px;
      weight: 500;
    }

    opacity: 0;
    background-color: $range-bg-color;
    border-radius: 4px;
    transition: all linear $timeout;

    &::after {
      content: '';

      position: absolute;
      bottom: 0;
      left: 48%;
      transform: translate(-50%, 100%);

      width: 0;
      height: 0;
      border-style: solid;
      border-width: 4px 3px 0 3px;
      border-color: $range-bg-color transparent transparent transparent;
    }
  }

  &__container:hover {
    .range__progress {
      background-color: $primary-dark-color;
    }
    .range__button {
      border-color: $primary-dark-color;
    }
  }

  &__container:active {
    .range__progress {
      background-color: $primary-press-color;
    }
    .range__button {
      border-color: $primary-press-color;
      box-shadow: 0 0 0 4px $range-bg-color;
    }
    .range__value {
      opacity: 1;
      color: $primary-press-color;

      transition: all linear $timeout;
    }
  }

  &__container.disabled {
    cursor: not-allowed;
    .range {
      background-color: $gray-extra-light-color;
      cursor: not-allowed;
      &::-webkit-slider-thumb {
        cursor: not-allowed;
      }
    }

    .range__progress,
    .range__button {
      background-color: $primary-light-color;
      border: 0;
    }

    &:active,
    &:hover {
      .range__progress,
      .range__button {
        background-color: $primary-light-color;
        border: 0;
      }
    }

    &:active {
      .range__button {
        box-shadow: none;
      }
    }
  }
}
</style>
