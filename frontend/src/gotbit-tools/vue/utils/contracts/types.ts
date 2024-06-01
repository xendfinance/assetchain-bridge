import type { ContractTransaction } from 'ethers'
import type { safeWrite } from '../safe'
import type { LegitContracts, useContracts } from './use'

type Filter<Big, Small> = Big extends Small ? Big : never
type FilterCondition<Source, Condition> = Pick<
  Source,
  { [K in keyof Source]: Source[K] extends Condition ? K : never }[keyof Source]
>

type FilterConditionInverse<Source, Condition> = Pick<
  Source,
  { [K in keyof Source]: Source[K] extends Condition ? never : K }[keyof Source]
>

export type Names = LegitContracts

export type Func = (...args: any) => any

type RestoreContract<C> = C extends Func ? ReturnType<C> : C
type ContractObject<Name extends Names> = RestoreContract<
  ReturnType<typeof useContracts>[Name]
>

type ReadFunctionsRaw<Name extends Names> = FilterConditionInverse<
  ContractObject<Name>,
  (...param: any) => Promise<ContractTransaction>
>

type WriteFunctionsRaw<Name extends Names> = FilterCondition<
  ContractObject<Name>,
  (...param: any) => Promise<ContractTransaction>
>

export type ReadFunctions<Name extends Names> = {
  [name in Filter<keyof ReadFunctionsRaw<Name>, string>]: (
    ...param: Parameters<Filter<ReadFunctionsRaw<Name>[name], Func>>
  ) => {
    def: <T = Awaited<ReturnType<Filter<ReadFunctionsRaw<Name>[name], Func>>>>(
      value: T,
    ) => Promise<T | Awaited<ReturnType<Filter<ReadFunctionsRaw<Name>[name], Func>>>>
    fulfill: <R>(
      callback: (
        value:
          | Awaited<ReturnType<Filter<ReadFunctionsRaw<Name>[name], Func>>>
          | undefined,
      ) => R,
    ) => Filter<R, FulfillReturn> extends FulfillReturn
      ? P<Filter<R, FulfillReturn>>
      : void
  }
}

type Call = { fulfill: (callback: (p: any) => any) => any }

type FulFillObj = {
  call: Call
  arg?: any
}

type FulfillReturn = FulFillObj | FulFillObj[]

type Member<T> = T extends (infer R)[] ? R : T

type Fulfilled<F extends FulfillReturn> = Parameters<
  Parameters<Member<F>['call']['fulfill']>[0]
>[0]

interface P<F extends FulfillReturn> {
  fulfill<R = never>(
    callback?: (value: Fulfilled<F>, arg: Member<F>['arg']) => R,
  ): R extends FulfillReturn ? P<R> : void
}

export type WriteFunctions<Name extends Names> = {
  [name in Filter<keyof WriteFunctionsRaw<Name>, string>]: (
    ...param: Parameters<Filter<WriteFunctionsRaw<Name>[name], Func>>
  ) => ReturnType<typeof safeWrite>
}
