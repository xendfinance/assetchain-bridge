<template>
  <div class="text-field">
    <div class="flex items-center">
      <input
        v-model="value"
        @keydown.enter="$emit('enter')"
        v-bind="{ ...attrs, type: 'text', style: props.style, class: '' }"
        class="text-field__input"
        :class="{
          'text-field__input_invalid': props.error,
          // '!pr-[40px]': props.image,
          '!pr-[100px]': props.textLabel,
        }"
      />

      <!-- <BaseIcon v-if="props.image" class="absolute right-3" v-bind="props.image" /> -->
      <div
        v-if="props.textLabel"
        class="absolute right-[24px] text-lg sm:text-xl text-grey"
      >
        {{ props.textLabel }}
      </div>
      <div v-if="props.maximize" @click="$emit('maximize')" class="max">MAX</div>
    </div>
    <div v-if="props.error" class="text-field__message">{{ props.errorMessage }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useAttrs, watch, InputHTMLAttributes, computed } from 'vue'
// import { IconProps } from '@/components/base/Icon.vue'

// import BaseIcon from '@/components/base/Icon.vue'

export interface InputTextProps extends InputHTMLAttributes {
  modelValue: string | number
  error?: boolean
  errorMessage?: string
  // image?: IconProps
  textLabel?: string
  validate?: 'float' | 'int'
  maximize?: boolean
  min?: number
  max?: number
  // symbol?: string
}

const props = defineProps<InputTextProps>()
const emit = defineEmits(['update:modelValue', 'enter', 'maximize'])

const attrs = useAttrs()

if (props.modelValue) emit('update:modelValue', props.modelValue)

const value = ref<string | number>(props.modelValue ?? '')

// const fullValue = computed(() => value.value + ' ' + props.symbol)

watch(
  () => props.modelValue,
  (newValue) => (value.value = newValue),
)
watch(value, (newValue, oldValue) => {
  if (props.validate) {
    let strValue = typeof value === 'string' ? value : (newValue as number).toString()
    const maxLength = 16
    switch (props.validate) {
      case 'float':
        if (strValue.toString().length > maxLength) {
          value.value = oldValue
          break
        }
        if (strValue === '') emit('update:modelValue', 0)
        else if (strValue.match(/^[0-9]*(\.[0-9]*)?$/)) {
          if (!strValue.match(/^[0-9]*\.[0-9]*0+$/) && !strValue.match(/^[0-9]*\.$/)) {
            emit('update:modelValue', parseFloat(strValue))
            value.value = parseFloat(strValue)
          }
        } else value.value = oldValue
        break
      case 'int':
        if (strValue.toString().length > maxLength) {
          value.value = oldValue
          break
        }
        if (strValue === '') emit('update:modelValue', 0)
        else if (strValue.match(/^[0-9]*$/)) {
          emit('update:modelValue', parseInt(strValue))
          value.value = parseInt(strValue)
        } else value.value = oldValue
        if (props.max)
          if (+strValue > props.max) {
            value.value = props.max
          }
        if (props.min)
          if (+strValue < props.min) {
            value.value = props.min
          }
        break
    }
  } else emit('update:modelValue', newValue)
})
</script>

<style scoped lang="scss">
@import '@/assets/config.scss';

.max {
  position: absolute;
  right: 24px;
  cursor: pointer;

  color: $primary-color;

  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
}

.text-field {
  position: relative;
  // margin-bottom: 1rem;
}

.text-field__label {
  display: block;
  // margin-bottom: 0.25rem;
}

.text-field__input {
  display: block;
  width: 100%;
  height: 100%;

  font: {
    family: inherit;
    size: 18px;
    weight: 400;
  }
  padding: 12px 18px;
  @include for-size(sm) {
    padding: 14px 24px;
    font-size: 20px;
  }

  color: $gray-light-color;
  background-color: transparent;
  background-clip: padding-box;
  border: 2px solid $gray-light-color;
  border-radius: 8px;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.text-field__input::placeholder {
  color: $gray-light-color;
  opacity: 0.4;
}

.text-field__input:focus {
  color: $black-color;
  background-color: transparent;
  border-color: $primary-color;
  outline: 0;
  // box-shadow: 0 0 0 0.2rem rgba(158, 158, 158, 0.25);
}

.text-field__input:disabled,
.text-field__input[readonly] {
  background-color: transparent;
  opacity: 1;
}

/* is invalid */
.text-field__input_invalid,
.text-field__input_valid {
  border-color: $error;
  // padding-left: 2.25rem;
  // background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  // background-repeat: no-repeat;
  // background-position: left 0.5625rem center;
  // background-size: 1.125rem 1.125rem;
}

// .text-field__input_valid {
//   border-color: $color-green;
//   // background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
// }

.text-field__input_invalid:focus {
  border-color: $error;
  // box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

// .text-field__input_valid:focus {
//   border-color: $color-green;
//   // box-shadow: 0 0 0 0.25rem rgb(25 135 84 / 25%);
// }

.text-field__message {
  white-space: pre-line;
  position: absolute;
  font-size: 12px;
  width: 100%;
  color: $error;
  @include for-size(sm) {
    font-size: 14px;
  }
}

// .text-field__input_valid ~ .text-field__message {
//   color: $color-green;
// }

.text-field__input_invalid ~ .text-field__message,
.text-field__input_valid ~ .text-field__message {
  display: block;
}
</style>
