import { defineStore } from 'pinia'

import type { CallbackFunction } from './types/pure'

import { useWeb3 } from './web3'
import { MulticallWorker } from '../multicall'

export const useMulticall = defineStore('$multicall', {
  state: () => ({
    muticallWorker: new MulticallWorker('main', true),
  }),
  actions: {
    requestCall<T>(
      call: Promise<T>,
      callback: CallbackFunction<T | undefined>,
      level?: number,
    ) {
      this.muticallWorker.requestCall(call, callback, level)
    },
    requestCalls(
      ...calls: { call: Promise<any>; callback: CallbackFunction<any | undefined> }[]
    ) {
      this.muticallWorker.requestCalls(...calls)
    },
    deferCall(level: number, callback: () => void) {
      this.muticallWorker.deferCall(level, callback)
    },
    async fulfillCalls() {
      await this.muticallWorker.fulfillCalls(useWeb3().chainId)
    },
    reset() {
      this.muticallWorker = new MulticallWorker('main', true)
    },
  },
})
