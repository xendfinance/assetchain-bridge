import { Contract, ethers, providers } from 'ethers'

import type { ChainId } from './types'

import { getChainRpc, getProvider } from './info'

import { config } from '@/gotbit.config'
import { chainIds } from './misc'
import { useFork } from './stores/fork'

function header(msg: string) {
  console.gotbit.log(
    '%c' + msg,
    `
      padding: 1rem;
      border-radius: .5rem;
      font-weight: bold;
    `,
  )
}

import contracts from '@/contracts/contracts.json'

export function getContracts() {
  try {
    const allContracts: {
      [key: string]: { contracts: { [key: string]: string }; chainId: string }
    } = {}

    for (const chainId of Object.keys(contracts)) {
      const contractInfo = (contracts as any)[chainId][0].contracts
      const chainName = (contracts as any)[chainId][0].name
      const table: { [key: string]: string } = {}

      for (const contr of Object.keys(contractInfo)) {
        if (contractInfo[contr].address === ethers.constants.AddressZero) continue
        table[contr] = contractInfo[contr].address
      }

      allContracts[chainName] = { contracts: table, chainId }
    }
    return allContracts
  } catch (e) {
    return {}
  }
}

export function debugInfo(always = false) {
  if (config.DEBUG || always) {
    console.clear()
    header('DEBUG mode: ON')
    if (isFork()) header('FORK [some call can be really slow]')

    const contractsAll = getContracts()
    for (const chainName of Object.keys(contractsAll)) {
      const chainId = contractsAll[chainName].chainId
      const table = contractsAll[chainName].contracts
      console.gotbit.group(
        `%c${chainId}) ${chainName}`,
        `
          color: #${'f'.repeat(6 - (chainId.length % 6))}${chainId}; 
          background: #${'0'.repeat(6 - (chainId.length % 6))}${chainId}; 
        `,
      )
      console.gotbit.table(table)
      console.gotbit.groupEnd()
    }

    for (const chainId of config.chainIds) console.log(chainId, getChainRpc(chainId))

    console.log('')
    console.gotbit.log(
      "Pretend user: \n%cprentend('user address')",
      'font-family: monospace',
    )
    console.log('')
  }
}

const GOTBIT_TOOLS_LABEL = '[gotbit-tools] '

export function debugOn() {
  console.log = console.always.log

  console.error = console.always.error
  console.warn = console.always.warn
  console.table = console.always.table
  console.group = console.always.group
  console.groupEnd = console.always.groupEnd

  console.gotbit = {
    log: (message?: any, ...optionalParams: any[]) =>
      console.log(GOTBIT_TOOLS_LABEL + message, ...optionalParams),
    error: (message?: any, ...optionalParams: any[]) =>
      console.error(GOTBIT_TOOLS_LABEL + message, ...optionalParams),
    warn: (...data: any[]) => console.warn(GOTBIT_TOOLS_LABEL, ...data),
    table: (tabularData: any, properties?: ReadonlyArray<string>) =>
      console.table(tabularData, properties),
    group: (...data: any[]) =>
      console.group(GOTBIT_TOOLS_LABEL + data[0], ...data.slice(1)),
    groupEnd: () => console.groupEnd(),
  }

  debugInfo(true)
}

window.debugOn = debugOn

export const isFork = () => import.meta.env.VITE_FORK === 'true'

export const getForkSigner = async (
  wallet: string,
): Promise<providers.JsonRpcSigner | null> => {
  if (isFork()) {
    const provider = getProvider(chainIds.localhost.toString() as ChainId)
    await provider.send('hardhat_impersonateAccount', [wallet])
    const signer = provider.getSigner(wallet)
    const sendTransaction = signer.sendTransaction.bind(signer)
    signer.sendTransaction = async (...args: Parameters<typeof sendTransaction>) => {
      const accept = new Promise((resolve, reject) => {
        const fork = useFork()
        fork.setupTx(resolve, reject)
      })
      await accept
      return await sendTransaction(args[0])
    }
    return signer
  }
  return null
}

export const filterTransaction = <B extends Contract>(
  signature: keyof B['interface']['functions'],
) => {
  return (args: { signature: string }) => signature === args.signature
}

export const filterCustomEvent = (name: string) => (args: { name: string }) =>
  args.name === name
