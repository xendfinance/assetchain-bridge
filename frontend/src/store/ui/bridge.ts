import { defineStore } from 'pinia'
import type { ChainId } from '@/gotbit-tools/vue/types'
import { IS_DEBUG } from '@/gotbit.config'

interface UIStore {
  inputAmount: string
  from: ChainId
  to: ChainId
  network: ChainId
}

export const useUIBridge = defineStore<'ui-bridge', UIStore>('ui-bridge', {
  state: () => {
    return {
      inputAmount: '',
      from: IS_DEBUG ? '421614' : '421614',
      to: IS_DEBUG ? '42421' : '42421',
      network: IS_DEBUG ? '421614' : '421614',
    }
  },
  actions: {},
})
