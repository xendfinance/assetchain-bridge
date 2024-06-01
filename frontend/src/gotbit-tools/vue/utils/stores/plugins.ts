import type { PiniaPluginContext } from 'pinia'
import { markRaw } from 'vue'
import type { Router } from 'vue-router'

export const routerPlugin =
  (router: Router) =>
  ({ store }: PiniaPluginContext) => {
    store.router = markRaw(router)
  }
