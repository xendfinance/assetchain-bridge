import { defineStore, StateTree } from 'pinia'
import type { DefineStoreOptions, _GettersTree } from 'pinia'
import type {
  IContractState,
  IContractActions,
  Nested,
  IContractStore,
} from './utils/stores/types/pure'
import type { StoreLifecycle } from './utils/stores/types/pure'
import { useEvent } from './utils/stores/event'

type ClearActions<A> = Omit<
  A,
  'toLocalStorage' | 'fromLocalStorage' | 'fromSessionStorage' | 'toSessionStorage'
>

type LoadsContractStore = Omit<IContractStore, StoreLifecycle> & {
  [key in StoreLifecycle]: () => Promise<boolean>
}

type CallbackFunction = () => Promise<any> | any

type Listeners = {
  addListener: (lifecycle: StoreLifecycle, callback: CallbackFunction) => number
  addListenerOnce: (lifecycle: StoreLifecycle, callback: CallbackFunction) => number
  removeListener: (listenerId: number) => void
}

export function defineContractStore<
  IState extends StateTree,
  IActions,
  IGetters extends _GettersTree<IState> = {},
  ILocalStorage extends Nested = Nested,
  ISessionStorage extends Nested = Nested,
>(
  name: string,
  options: Omit<
    DefineStoreOptions<
      string,
      IState & IContractState,
      IGetters,
      ClearActions<IActions & IContractActions> & {
        toLocalStorage?(): ILocalStorage
        fromLocalStorage?(storage: ILocalStorage): void
        fromSessionStorage?(storage: ISessionStorage): void
        toSessionStorage?(): ISessionStorage
      }
    >,
    'id'
  >,
) {
  return defineStore<
    string,
    IState & IContractState,
    IGetters,
    ClearActions<IActions & LoadsContractStore & Listeners> & {
      toLocalStorage?(): ILocalStorage
      fromLocalStorage?(value: ILocalStorage): void
      fromSessionStorage?(storage: ISessionStorage): void
      toSessionStorage?(): ISessionStorage
    }
  >(name, {
    ...(options as any),
    actions: {
      ...options.actions,
      addListener: (
        lifecycle: StoreLifecycle,
        callback: () => Promise<any> | any,
      ): number => useEvent().addListener(lifecycle, callback),
      addListenerOnce: (
        lifecycle: StoreLifecycle,
        callback: () => Promise<any> | any,
      ): number => useEvent().addListenerOnce(lifecycle, callback),
      removeListener: (listenerId: number) => useEvent().removeListener(listenerId),
    },
  })
}
