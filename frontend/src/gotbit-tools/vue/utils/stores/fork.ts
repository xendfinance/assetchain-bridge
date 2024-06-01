import { defineStore } from 'pinia'

export const useFork = defineStore('$fork', {
  state: () => ({
    newTx: false,
    resolveTx: () => {},
    rejectTx: () => {},
    requestWallet: false,
  }),
  getters: {
    isOpen: (state) => state.newTx || state.requestWallet,
  },
  actions: {
    acceptTx() {
      if (this.newTx) this.resolveTx()
      this.newTx = false
    },
    cancelTx() {
      if (this.newTx) this.rejectTx()
      this.newTx = false
    },
    setupTx(resolve: (arg: null) => void, reject: (msg: string) => void) {
      this.resolveTx = () => resolve(null)
      this.rejectTx = () => reject('Transaction has been cancelled')
      this.newTx = true
    },
  },
})
