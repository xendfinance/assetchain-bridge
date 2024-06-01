import { CallbackFunction, ChainId } from '../types'
import { getMulticallProvider } from './info'

import { safeRead } from './safe'

export class MulticallWorker {
  public requestedCalls: {
    call: any
    callback: CallbackFunction<any>
    id: number
    level: number
  }[] = []
  public currentLevel = 1
  public currentId = 1
  public deferredCalls: { level: number; callback: () => void }[] = []

  constructor(
    public name?: string,
    public verbose = false,
  ) {}

  requestCall<T>(
    call: Promise<T>,
    callback: CallbackFunction<T | undefined>,
    level?: number,
  ) {
    if (!level) level = this.currentLevel
    this.requestedCalls.push({ call, callback, id: this.currentId, level })
    this.currentId++
  }

  requestCalls(
    ...calls: { call: Promise<any>; callback: CallbackFunction<any | undefined> }[]
  ) {
    calls.forEach((call) => this.requestCall(call.call, call.callback))
  }

  deferCall(level: number, callback: () => void) {
    this.deferredCalls.push({ level, callback })
  }

  async fulfillCalls(chainId: ChainId) {
    if (this.requestedCalls.length === 0) {
      if (this.deferredCalls.length !== 0) {
        this.deferredCalls.forEach((d) => d.callback())
        this.deferredCalls = []
        await this.fulfillCalls(chainId)
      } else {
        this.currentLevel = 1
        return
      }
    }

    if (this.verbose)
      console.gotbit.log(
        `Fulfilling [${this.requestedCalls.length}] calls on ${this.currentLevel} lvl (${this.name}, ${chainId})`,
      )

    const providerMulticall = getMulticallProvider(chainId)
    const defaultAnswer: undefined[] = new Array(this.requestedCalls.length).fill(
      undefined,
    )

    let fulfilledCalls: any[] = []
    this.deferredCalls
      .filter((d) => d.level === this.currentLevel)
      .forEach((d) => d.callback())
    this.deferredCalls = this.deferredCalls.filter((d) => d.level !== this.currentLevel)

    const requestedCallOnLevel = this.requestedCalls.filter(
      (c) => c.level === this.currentLevel,
    )

    this.requestedCalls = this.requestedCalls.filter((c) => c.level > this.currentLevel)

    fulfilledCalls = await safeRead(
      providerMulticall.all(requestedCallOnLevel.map((r) => r.call)),
      defaultAnswer,
      (error) => {
        if (this.verbose)
          console.gotbit.warn(
            `One or more requested calls failed, all other calls are failed too ${this.name}`,
          )
        console.gotbit.error(error)
      },
    )

    this.currentLevel++
    await Promise.all(
      fulfilledCalls.map(async (answer, index) => {
        await requestedCallOnLevel[index].callback(answer)
      }),
    )

    await this.fulfillCalls(chainId)
  }
}
