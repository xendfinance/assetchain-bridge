import { Contract, BaseContract } from 'ethers'
import { getContractsInfo, getProvider } from '../info'
import type { ContractsName } from '../info'

import type { ChainId } from '../types'
import { ToRealChainIds } from '../defines'

/** Builds contract base on chainId, address and TS Interface
 * @param {ContractsName<SelectedChainId>} name - name of contract from `@/contracts/contracts.json`
 * @returns {(chainId: SelectedChainId) => Interface} arrow function with `chainId` as a parameter which returns contract with connected provider
 */
export const addContractI = <
  Interface extends BaseContract = BaseContract,
  SelectedChainId extends ChainId = ChainId,
>(
  name: ContractsName<SelectedChainId>,
): ((chainId: SelectedChainId) => Interface) => {
  return (chainId: SelectedChainId) => {
    const contractsInfo = getContractsInfo(chainId)
    const provider = getProvider(chainId)

    return new Contract(
      /// @ts-ignore
      contractsInfo[name].address,
      /// @ts-ignore
      contractsInfo[name].abi,
      provider,
    ) as Interface
  }
}

export const addContract = addContractI

/** Builds contract base on chainId and TS Interface
 * @param {ContractsName<SelectedChainId>} name - name of contract from `@/contracts/contracts.json`
 * @returns {(chainId: SelectedChainId) => (address: string) => Interface} arrow function with address as a parameter which retursn arrow function with `chainId` as a parameter which returns contract with connected provider
 */
export const addContractWithAddressI = <
  Interface extends BaseContract = BaseContract,
  SelectedChainId extends ChainId = ChainId,
>(
  name: ContractsName<SelectedChainId>,
): ((chainId: SelectedChainId) => (address: string) => Interface) => {
  return (chainId: SelectedChainId) => {
    const contractsInfo = getContractsInfo(chainId)
    const provider = getProvider(chainId)
    return (address: string) =>
      /// @ts-ignore
      new Contract(address, contractsInfo[name].abi, provider) as Interface
  }
}

export const addContractWithAddress = addContractWithAddressI

// export function addContract<Name extends TypedInterface>(name: Name) {
//   return (chainId: ChainId) => {
//     const contractsInfo = getContractsInfo(chainId)
//     const provider = getProvider(chainId)
//     return new Contract(
//       contractsInfo[name].address,
//       contractsInfo[name].abi,
//       provider
//     ) as ContractInterface<Name>
//   }
// }

// export function addContractWithAddress<Name extends TypedInterface>(name: Name) {
//   return (chainId: ChainId) => {
//     const contractsInfo = getContractsInfo(chainId)
//     const provider = getProvider(chainId)
//     return (address: string) =>
//       new Contract(address, contractsInfo[name].abi, provider) as ContractInterface<Name>
//   }
// }
