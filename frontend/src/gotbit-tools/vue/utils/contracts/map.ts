import type { BaseContract } from 'ethers'
import type { CallbackFunction } from '../../types'
import { useWeb3 } from '../stores/web3'
import { useMulticall } from '../stores/multicall'

import type { WriteFunctions, ReadFunctions, Names, Func } from './types'

import { safeRead, safeWrite } from '../safe'
import { useContracts, multicall as multicallContract } from './use'

import { Fulfiller } from './utils'

import { contracts } from '@/gotbit.config'
import { useEvent } from '../stores/event'

const defer = (level: number, callback: () => void) => {
  const multicall = useMulticall()
  multicall.deferCall(level, callback)
}

export type ContractActions<Name extends Names> = {
  [key in Name as `_${key}`]: ReturnType<typeof useContracts>[key] extends Func
    ? (address: string) => WriteFunctions<Name> & ReadFunctions<Name>
    : () => WriteFunctions<Name> &
        ReadFunctions<Name> & {
          defer: (level: number, callback: () => void) => void
        }
} & { $defer: typeof defer }

export const mapContractSafe = <Name extends Names>(name: Name) => {
  if (Object.keys(contracts).length === 0) return {} as ContractActions<Name>

  const contract = contracts[name]

  const process = (name: string, contract: BaseContract, ...params: any) => {
    const functions = contract.interface.functions
    let signature = name

    for (const f of Object.keys(functions)) if (functions[f].name === name) signature = f

    if (functions[signature].constant) {
      return {
        def: (value: any) => safeRead((contract as any)[signature](...params), value),
        fulfill: (callback: CallbackFunction<any>) =>
          new Fulfiller((multicallContract(contract) as any)[name](...params), callback),
        multicall: (multicallContract(contract) as any)[name](...params),
      }
    } else {
      const web3 = useWeb3()
      console.gotbit.log('[CALL]', {
        address: contract.address,
        method: signature,
        params,
      })
      if (web3.signer) {
        const event = useEvent()
        event._emit('beforeContractTransaction', { signature, params })
        return safeWrite(
          (contract.connect(web3.signer) as any)[signature](...params),
        ).then((r) => {
          event._emit('contractTransaction', { signature, params })
          return r
        })
      } else {
        console.gotbit.error('Call write function with connection')
        return [null, null]
      }
    }
  }

  const ans = (address: string) => {
    const web3 = useWeb3()
    /// @ts-ignore
    const rawC = contract(web3.chainId)
    /// @ts-ignore
    const c = typeof rawC === 'function' ? rawC(address) : rawC

    const r = {} as any

    r.defer = defer

    const proxyR = new Proxy(r, {
      get(_, prop) {
        if (r.hasOwnProperty(prop)) return r[prop]
        const funcName = prop as string
        if ((c as any)[funcName]) {
          return (...params: any) => process(funcName, c, ...params)
        } else {
          console.gotbit.error(`Not existing function "${funcName}"`)
        }
      },
    })
    return proxyR
  }

  const mappedContractSafe = {
    [`_${name}`]: ans,
    $defer: defer,
  } as unknown as ContractActions<Name>

  return mappedContractSafe
}
