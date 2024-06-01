import type { ContractTransaction } from 'ethers'

import '../types/global'
import { useWeb3 } from '../utils/stores/web3'
import { config, storeSettings } from '@/gotbit.config'

export const makePromise = (status: boolean, result: any) => {
  return new Promise<any>((resolve, reject) => {
    if (status) resolve(result)
    else reject()
  })
}

export const makeTx = (status: boolean): Promise<ContractTransaction> => {
  const fakeTx = { wait: () => Promise.resolve<any>(true) } as ContractTransaction
  return new Promise((resolve, reject) => {
    if (status) resolve(fakeTx)
    else reject()
  })
}

export const initWeb3 = () => {
  const web3 = useWeb3()
  web3.chainIds = config.chainIds
  web3.chainId = config.DEFAULT_CHAINID
  web3.DEFAULT_CHAINID = config.DEFAULT_CHAINID
  web3.storeSettings = storeSettings
}
