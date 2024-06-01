import { utils } from 'ethers'
import type { BaseContract } from 'ethers'
import { Contract as MutlicallContract } from 'ethers-multicall'

import type { INotNullSigner } from '../stores/types/pure'
import type { CallbackFunction } from '../../types'
import type { ChainId } from '../types'
import type { ContractFunction } from '../defines'

import { useWeb3 } from '../stores/web3'
import { contracts as definedContracts, config } from '@/gotbit.config'
import { toMainChainIds } from '../info'

export type LegitChainIds = Extract<keyof typeof definedContracts, ChainId>
export type LegitContracts = Exclude<keyof typeof definedContracts, ChainId>

type Return<T> = T extends (...args: any) => infer T ? T : never

/** Returns object of contracts and multicall contracst from config with connected provider
 * @param {INotNullSigner=} signer - connected signer
 * @param {SelectedChainId=} chainId - target chainId
 */
export function useContracts<SelectedChainId extends LegitChainIds>(
  signer?: INotNullSigner,
  chainId?: SelectedChainId,
) {
  type RealChainId = SelectedChainId extends undefined ? LegitChainIds : SelectedChainId

  type NamesOnChain = keyof (typeof definedContracts)[RealChainId]
  type NamesOffChain = LegitContracts

  type OnChainedContracts = {
    [name in NamesOnChain]: Return<(typeof definedContracts)[RealChainId][name]>
  }

  type OffChainedContracts = {
    [name in NamesOffChain]: Return<(typeof definedContracts)[name]>
  }

  type OnChainedMulticallContracts = {
    [name in NamesOnChain as name extends string ? `\$${name}` : name]: Return<
      (typeof definedContracts)[RealChainId][name]
    >
  }

  type OffChainedMulticallContracts = {
    [name in NamesOffChain as `\$${name}`]: Return<(typeof definedContracts)[name]>
  }

  // type OnChainedMulticallContracts = {
  //   [name in NamesOnChain as name extends string ? `\$${name}` : name]: {
  //     [func in keyof Return<typeof definedContracts[RealChainId][name]>]: SimFunc<
  //       Return<typeof definedContracts[RealChainId][name]>[func],
  //       {
  //         fulfill: (
  //           func: (
  //             params: Awaited<
  //               Return<Return<typeof definedContracts[RealChainId][name]>[func]>
  //             >
  //           ) => any
  //         ) => void
  //       }
  //     >
  //   }
  // }

  // type OffChainedMulticallContracts = {
  //   [name in NamesOffChain as `\$${name}`]: {
  //     [func in keyof Return<typeof definedContracts[name]>]: SimFunc<
  //       Return<typeof definedContracts[name]>[func],
  //       {
  //         fulfill: (
  //           func: (
  //             params: Awaited<Return<Return<typeof definedContracts[name]>[func]>>
  //           ) => any
  //         ) => void
  //       }
  //     >
  //   }
  // }

  const chainedContracts = {} as any

  const web3 = useWeb3()
  const realChainId = chainId ?? web3.chainId

  /// @ts-ignore
  if (Object.keys(definedContracts).length === 0)
    return {} as OnChainedContracts &
      OffChainedContracts &
      OnChainedMulticallContracts &
      OffChainedMulticallContracts

  const allContracts = {
    /// @ts-ignore
    ...definedContracts[realChainId],
    ...Object.fromEntries(
      Object.entries(definedContracts).filter(
        ([key]) => !config.chainIds.includes(key as any),
      ),
    ),
  } as any // TODO: fix `any` typing

  if (definedContracts.hasOwnProperty(toMainChainIds(realChainId))) {
    for (const [key, value] of Object.entries<ContractFunction<ChainId>>(allContracts)) {
      const contract = value(realChainId)
      if (signer) {
        if (typeof contract === 'function') {
          chainedContracts[key] = (address: string) => contract(address).connect(signer)
          chainedContracts['$' + key] = (address: string) => multicall(contract(address))
        } else {
          chainedContracts[key] = contract.connect(signer)
          chainedContracts['$' + key] = multicall(contract)
        }
      } else {
        if (typeof contract === 'function') {
          chainedContracts[key] = (address: string) => contract(address)
          chainedContracts['$' + key] = (address: string) => multicall(contract(address))
        } else {
          chainedContracts[key] = contract
          chainedContracts['$' + key] = multicall(contract)
        }
      }
    }
  }

  return chainedContracts as OnChainedContracts &
    OffChainedContracts &
    OnChainedMulticallContracts &
    OffChainedMulticallContracts
}

/** Returns if user loged in or not to `web3` store
 * @returns {boolean} login status
 */
export const isLogin = (): boolean => {
  if (useWeb3().login) return true
  console.gotbit.warn('User is not connected')
  return false
}

/** Converts `ethers` contract to `ethers-multicall` contract with `ethers'` interface
 * @param {Contract} contract - `ethers` contract
 * @returns {MutlicallContract} `ethers-multicall` contract
 */
export const multicall = <Contract extends BaseContract>(
  contract: Contract,
): Contract => {
  const abi = contract.interface.format(utils.FormatTypes.full) as string[]
  return new MutlicallContract(contract.address, abi) as unknown as Contract
}

/** Builds call for `web3` store
 * @param {Promise<T>} call - call from multicall contract
 * @param {CallbackFunction<T | undefined>} callback - callback function to proceed result from call
 * @returns {{call: Promise<T>, callback: CallbackFunction<T | undefined>}} builded object for `web3` store
 */
export const call = <T>(
  call: Promise<T>,
  callback: CallbackFunction<T | undefined>,
): { call: Promise<T>; callback: CallbackFunction<T | undefined> } => ({
  call,
  callback,
})

/** Extract Solidity error from rpc error
 * @param {any} error - error from rpc
 * @returns {string | undefined} Solidity error
 */
export const solError = (error: any): string | undefined => {
  try {
    return JSON.parse(error.error.error.body).error.message
  } catch (error) {
    console.gotbit.error(error)
    return undefined
  }
}
