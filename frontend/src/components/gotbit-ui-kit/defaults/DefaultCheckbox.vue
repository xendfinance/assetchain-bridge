<script setup lang="ts">
export interface radioGroupProps {
  label?: string
  active: boolean
}
const props = defineProps<radioGroupProps>()
</script>

<template>
  <div class="toggle_radio__container">
    <span class="toggle_radio__text" v-if="props.label != undefined">
      {{ props.label }}
    </span>
    <div class="toggle_radio" :class="{ active: active }">
      <span class="toggle_radio__icon"></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/components/gotbit-ui-kit/assets/config.scss';
$timeout: 0.2s;

.toggle_radio {
  @include size-box(20px);
  position: relative;
  transition: all $timeout linear;

  border: solid 1px {
    color: $gray-color;
    radius: 2px;
  }

  &__container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
  }

  &__icon {
    position: absolute;
    left: 3px;
    top: 3px;

    @include size-box(12px);
    background-color: transparent;
    border-radius: 2px;
    transition: all $timeout linear;

    &--done {
      @include size-box(100%);
    }
  }

  &.active &__icon {
    background-color: $primary-color;
    transition: all $timeout linear;

    &:hover {
      background-color: $primary-dark-color;
    }

    &:active {
      background-color: $primary-color;
    }
  }

  &:hover {
    border-color: $gray-dark-color;
    transition: all $timeout linear;
  }
  &:active {
    border-color: $gray-color;
    transition: all $timeout linear;

    &::before {
      background-color: $press-default-color;
    }
  }
  &.active {
    color: $primary-color;
    border-color: $primary-color;

    &:hover {
      border-color: $primary-dark-color;
    }

    &:active {
      &::before {
        background-color: $press-active-color;
      }
    }
  }

  //==Size==
  &.lg {
    $size: 32px;

    &.checkbox {
      @include size-box($size);
      .toggle__icon {
        @include size-box($size);
      }
    }

    &::before {
      $indent: 16px;

      left: -$indent;
      top: -$indent;
      @include size-box(calc(100% + ($indent * 2)));
    }
  }

  &.sm {
    $size: 20px;

    &.checkbox {
      @include size-box($size);
      .toggle__icon {
        @include size-box($size);
      }
    }

    &::before {
      $indent: 8px;

      left: -$indent;
      top: -$indent;
      @include size-box(calc(100% + ($indent * 2)));
    }
  }

  &::before {
    content: '';
    position: absolute;
    z-index: -1;

    border-radius: 2px;
    transition: all $timeout linear;
  }
}
</style>
