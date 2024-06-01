import { defineStore } from 'pinia'
import dialogs from '@/components/popups'

type DialogName = keyof typeof dialogs

export interface Dialog {
  name: string
  props: object
  params?: Params
}
export type Params = Partial<{
  notClosable: boolean
  noCross: boolean
}>

export const useDialogs = defineStore('dialogs', {
  state: () => {
    return {
      currentDialog: undefined as Dialog | undefined,
      show: false,
    }
  },
  actions: {
    async openDialog<N extends DialogName>(
      name: N,
      props: InstanceType<(typeof dialogs)[N]>['$props'],
      params?: Params,
    ) {
      const dialog: Dialog = {
        name,
        props,
        params,
      }
      this.show = true
      this.currentDialog = dialog
    },
    closeCurrentDialog() {
      if (this.currentDialog?.params?.notClosable) return

      this.show = false
    },
  },
})
