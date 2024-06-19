<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ButtonHTMLAttributes } from 'vue'
import type { Size, State } from '@/components/gotbit-ui-kit/types'

import LoaderIcon from '@/components/gotbit-ui-kit/icons/LoaderIcon.vue'
import DoneIcon from '@/components/gotbit-ui-kit/icons/DoneIcon.vue'

export interface ButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  size?: Size
  state?: State
  disabled?: boolean
  connect?: boolean
  cancel?: boolean
  red?: boolean
  icon?: boolean
  width?: String
  mobile?: boolean
  login?: boolean
  confirm?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {})

const emit = defineEmits(['click'])
const button = ref<HTMLElement | null>(null)

onMounted(() => {
  try {
    const tag = button.value as any

    if (props.width) {
      tag.style.width = props.width
    }
  } catch (e) {
    console.error(e)
  }
})
</script>

<template>
  <div
    class="flex justify-center items-center rounded-[52px]"
    :class="{
      'w-[203px] h-[52px]': props.size == 'md',
      'w-[161px] h-[42px]': props.size == 'sm',
      'w-[115px] h-[37px]': props.size == 'sx',
      wrapper: props.connect || props.mobile,
      'wrapper-red': props.red,
      'hover:!bg-none': props.login || props.confirm,
    }"
  >
    <button
      v-bind="props"
      class="text-white bg-primary-card rounded-[52px]"
      :class="[
        {
          '!bg-transparent': props.cancel,
          'w-[159px] h-[40px] md:w-[201px] md:h-[50px] no-connect': props.connect,
          'w-[201px] h-[40px] no-connect': props.mobile,
          'w-[113px] h-[35px] btn-red': props.red,
          ...props,
        },
        props.size,
        props.state,
      ]"
      @click="emit('click')"
    >
      <slot name="prefix-icon"></slot>
      <slot></slot>
      <slot name="suffix-icon"></slot>

      <LoaderIcon
        v-if="state == 'loader'"
        class="icon__fill"
        size="20"
        stroke="#fff"
        transform="scale(1.2)"
      />
      <DoneIcon v-if="state == 'done'" class="icon__fill" size="20" stroke="#fff" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';

$timeout: 0.25s;

.wrapper {
  background: linear-gradient(
    108.49deg,
    $gradient-primary-from 0%,
    $gradient-primary-to 95.17%
  );
  &:hover {
    background: linear-gradient(108.49deg, #42aa84 0%, #0effa8 95.17%);
  }
  &:active {
    background: linear-gradient(
      108.49deg,
      $gradient-primary-from 0%,
      $gradient-primary-to 95.17%
    );
  }
}

.wrapper-red {
  width: 115px;
  height: 37px;
  background: linear-gradient(
    92.14deg,
    $gradient-error-from 6.74%,
    $gradient-error-to 94.95%
  );
  color: $white-color;
}

button {
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
}

.no-connect {
  &:hover {
    background: linear-gradient(108.49deg, #42aa84 0%, #0effa8 95.17%);
  }
  &:active {
    background: linear-gradient(
      108.49deg,
      $gradient-primary-from 0%,
      $gradient-primary-to 95.17%
    );
  }
}

.login {
  &:hover {
    background: linear-gradient(
      108.49deg,
      $gradient-primary-from 0%,
      $gradient-primary-to 95.17%
    );
  }
}

.btn-red {
  &:hover {
    background: linear-gradient(0deg, rgba(139, 66, 170, 0.2), rgba(139, 66, 170, 0.2)),
      linear-gradient(92.14deg, #de2366 6.74%, rgba(251, 22, 104, 0.3) 94.95%);
  }
  &:active {
    background: #de2366;
  }
}

.confirm {
  &:hover {
    background: linear-gradient(108.49deg, #42aa84 0%, #0effa8 95.17%);
  }
  &:active {
    background: linear-gradient(
      108.49deg,
      $gradient-primary-from 0%,
      $gradient-primary-to 95.17%
    );
  }
}
</style>
