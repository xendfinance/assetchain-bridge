import type { providers, Signer, VoidSigner, Wallet } from 'ethers'

export const storeLifecycles = ['onInit', 'onLogin', 'onFinal', 'onLogout'] as const
export type StoreLifecycle = (typeof storeLifecycles)[number]

export type ISigner = providers.JsonRpcSigner | Wallet | Signer | VoidSigner | null
export type INotNullSigner = NonNullable<ISigner>

export interface IContractState {
  loading: boolean
}

export type Simple = number | string | boolean | bigint | null | undefined

export type Nested = {
  [k1: string | number]: Simple | Array<Simple> | Nested | Array<Nested>
}
export type IContractActions = {
  toLocalStorage?(): Nested
  fromLocalStorage?(value: Nested): void
  toSessionStorage?(): Nested
  fromSessionStorage?(value: Nested): void
} & Partial<{
  [key in StoreLifecycle]: () => Promise<boolean>
}>

export type IContractStore = IContractState &
  IContractActions & {
    $subscribe: (f: () => void) => void
  }
export type IContractStoreDefinition = (() => IContractStore) & {
  $id: string
}

export type CallbackFunction<Args> = (...args: Args[]) => Promise<any> | any
