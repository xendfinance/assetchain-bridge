import type { CallbackFunction } from '../../types'
import { useMulticall } from '../stores/multicall'

type CallInner = { call: any; arg?: any }

export class Fulfiller {
  answers: { response: any; calls: CallInner[] }[] = []
  pending: { callback: any; level: number }[] = []
  level: number

  constructor(call: any, callback: CallbackFunction<any>) {
    const multicall = useMulticall()

    const callbackWrapper = async (response: any) => {
      const calls = (await callback(response)) as CallInner[] | CallInner
      if (calls)
        if ((calls as any).length)
          this.answers.push({ response, calls: calls as CallInner[] })
        else this.answers.push({ response, calls: [calls as CallInner] })
      this.next()
    }
    this.level = multicall.muticallWorker.currentLevel + 1
    multicall.requestCall(call, callbackWrapper)
  }
  fulfill(callback: CallbackFunction<any>) {
    this.pending.push({ callback, level: this.level })
    this.level++
    return this
  }
  next() {
    const multicall = useMulticall()
    const callback = this.pending.filter(
      (p) => p.level === multicall.muticallWorker.currentLevel,
    )[0]
    if (!callback) return

    for (const answer of this.answers) {
      for (let i = 0; i < answer.calls.length; i++) {
        const callbackWrapper = async (response: any) => {
          const calls = (await callback.callback(response, answer.calls[i].arg)) as
            | CallInner[]
            | CallInner
          if (calls)
            if ((calls as any).length)
              this.answers.push({ response, calls: calls as CallInner[] })
            else this.answers.push({ response, calls: [calls as CallInner] })

          this.next()
        }
        multicall.requestCall(answer.calls[i].call.multicall, callbackWrapper)
      }
    }
    this.answers = []
  }
}

export const filterTransaction = (
  func: string,
  eventArgs: { signature: string; params: any },
) => {
  return eventArgs.signature.includes(func)
}
