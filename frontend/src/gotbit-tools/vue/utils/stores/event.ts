import { defineStore } from 'pinia'
import { StoreLifecycle } from './types/pure'

type CallbackFunction = (...args: any) => any

type RawEvents = {
  onChainChange: { args: { chainId: string; natural: boolean } }
  onWalletChange: { args: { wallet: string } }
  errorChainId: { args: { chainId: string } }
  contractTransaction: { args: { signature: string; params: any } }
  custom: { args: { name: string; args: any } }
} & {
  [key in StoreLifecycle]: { args: {} }
}

type BeforeEvent<E extends string> = `before${Capitalize<E>}`
type AfterEvent<E extends string> = `after${Capitalize<E>}`

type Events = {
  [E in keyof RawEvents as E | BeforeEvent<E> | AfterEvent<E>]: RawEvents[E]
}

export type RawEventType = keyof RawEvents
export type EventType = keyof Events
export type Filter<Event extends EventType> = (args: Events[Event]['args']) => boolean

export function capitalize<T extends string>(a: T): Capitalize<T> {
  return (a[0].toUpperCase() + a.slice(1)) as Capitalize<T>
}

export function toBeforeEvent<E extends RawEventType>(event: E) {
  return `before${capitalize(event)}` as `before${Capitalize<E>}`
}

export function toAfterEvent<E extends RawEventType>(event: E) {
  return `after${capitalize(event)}` as `after${Capitalize<E>}`
}

export const useEvent = defineStore('$event', {
  state: () => ({
    listeners: [] as {
      id: number
      event: EventType
      once: boolean
      callback: CallbackFunction
      filters: Filter<any>[]
    }[],
    listenerId: 1,
  }),
  actions: {
    addListener<Event extends EventType>(
      event: Event,
      callback: (args: Events[Event]['args']) => any,
      filters: Filter<Event>[] = [],
    ): number {
      this.listeners.push({
        id: this.listenerId,
        event,
        once: false,
        callback,
        filters,
      })
      return this.listenerId++
    },
    addCustomListener<E>(
      name: string,
      callback: (args: E) => any,
      filters: Filter<any>[] = [],
    ) {
      return this.addListener('custom', ({ args }) => callback(args), [
        (args) => args.name === name,
        ...filters,
      ])
    },
    addListenerOnce<Event extends EventType>(
      event: Event,
      callback: (args: Events[Event]['args']) => any,
      filters: Filter<Event>[] = [],
    ): number {
      this.listeners.push({
        id: this.listenerId,
        event,
        once: true,
        callback,
        filters,
      })
      return this.listenerId++
    },
    addCustomListenerOnce<E>(
      name: string,
      callback: (args: E) => any,
      filters: Filter<any>[] = [],
    ) {
      return this.addListenerOnce('custom', ({ args }) => callback(args), [
        (args) => args.name === name,
        ...filters,
      ])
    },
    removeListener(listenerId: number) {
      this.listeners = this.listeners.filter((l) => l.id !== listenerId)
    },
    async emit<Event extends RawEventType>(event: Event, args: Events[Event]['args']) {
      await this._emit(toBeforeEvent(event), args)
      await this._emit(event, args)
      await this._emit(toAfterEvent(event), args)
    },
    async emitCustom<E>(name: string, args: E) {
      await this.emit('custom', { name, args })
    },
    async _emit<Event extends EventType>(event: Event, args: Events[Event]['args']) {
      const removeIds: number[] = []
      await Promise.all(
        this.listeners
          .filter((l) => l.event === event)
          .map(async (l) => {
            if (!(l.filters.some((f) => f(args)) || l.filters.length === 0)) return

            if (l.once) removeIds.push(l.id)
            await l.callback(args)
          }),
      )

      removeIds.forEach(this.removeListener)
    },
  },
})
