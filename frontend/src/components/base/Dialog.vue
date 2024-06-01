<template>
  <Transition name="move">
    <div
      v-if="dialogs.currentDialog !== undefined && dialogs.show !== false"
      @click="dialogs.closeCurrentDialog()"
      class="custom-dialog"
    >
      <div
        v-if="copied"
        class="fixed top-20 right-20 z-50 flex items-center gap-2 bg-primary-card p-6 rounded-md"
      >
        <img src="@/assets/imgs/check-circle.svg" />
        <span class="w-[186px] text-[15px]">Address is copied</span>
        <button @click="copied = false">
          <CloseIcon />
        </button>
      </div>
      <div
        @click.stop
        class="wrapper px-5 md:px-[70px] pt-10 pb-10 bg-select-drop max-w-[400px] w-full md:max-w-[480px] rounded-[16px]"
      >
        <div v-if="hasCross" class="flex justify-end absolute right-5 top-5">
          <button @click="dialogs.closeCurrentDialog()">
            <CloseIcon class="w-6 h-6" />
          </button>
        </div>

        <component
          :is="dialogs.currentDialog?.name"
          v-bind="dialogs.currentDialog?.props"
          @copy="copyText"
        >
        </component>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CloseIcon from '@/components/base/icons/CloseIcon.vue'
import { ref } from 'vue'

import { useDialogs } from '@/store/ui/dialogs'

const dialogs = useDialogs()

const hasCross = computed(
  () =>
    !(
      dialogs.currentDialog?.params?.notClosable || dialogs.currentDialog?.params?.noCross
    ),
)

const copied = ref(false)
const copyText = () => {
  copied.value = true
  setTimeout(() => (copied.value = false), 5000)
}
</script>

<style scoped lang="scss">
@import '@/assets/config.scss';

.move-enter-active,
.move-leave-active {
  transition: all 0.4s ease;
}
.move-enter-from,
.move-leave-to {
  opacity: 0;
  transform: translateY(50px);
}

.custom-dialog {
  position: fixed;
  top: -50px;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
}

.wrapper {
  position: fixed;
  top: 53%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  box-shadow: 0px 32px 64px rgba(36, 37, 38, 0.12);
}

.dialog-form {
  border-radius: 24px;
  background-color: white;
  position: relative;
}

.close-cross {
  position: absolute;
  align-self: flex-end;
  margin-bottom: 4px;
}
</style>
