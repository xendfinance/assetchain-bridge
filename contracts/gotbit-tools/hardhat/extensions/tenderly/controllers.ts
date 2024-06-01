import { ContractResponse } from 'hardhat-deploy-tenderly/dist/src/tenderly/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Fork } from './types'
import {
  getFork,
  getForkId,
  getForks,
  getRequests,
  getTenderlyApi,
  getTenderlyConfig,
  getTenderlyProject,
  PREFIX,
  TENDERLY_RPC_BASE,
} from './utils'

export const push = async (hre: HardhatRuntimeEnvironment) => {
  console.log('Pushing contracts on tenderly...')
  const yamlData = getTenderlyConfig()
  const tenderlyApi = getTenderlyApi()
  const tenderlyProject = getTenderlyProject(hre)

  const apiPathPush = `/api/v1/account/${yamlData.username}/project/${tenderlyProject}/contracts`

  const requests = await getRequests(hre)
  for (const request of requests) {
    try {
      console.log(`Pushing "${request.name}"`)
      const responsePush = await tenderlyApi.post(apiPathPush, {
        ...request,
      })
      const responseData: ContractResponse = responsePush.data

      if (responseData.bytecode_mismatch_errors != null) {
        console.error(
          `Error: Bytecode mismatch detected. Contract push failed "${request.name}"`
        )
        continue
      }

      if (!responseData.contracts?.length) {
        console.error(`Not pushed "${request.name}"`)
        continue
      }

      console.log(`Success "${request.name}"`)
    } catch (e) {
      console.log(`Error to push "${request.name}"`)
    }
  }

  console.log('Done')
}

export const verify = async (hre: HardhatRuntimeEnvironment) => {
  console.log('Verifying contracts on fork tenderly...')

  const yamlData = getTenderlyConfig()
  const tenderlyApi = getTenderlyApi()
  const tenderlyProject = getTenderlyProject(hre)
  const forkId = getForkId(hre)

  const requests = await getRequests(hre, forkId)
  const fork = await getFork(yamlData.username, tenderlyProject, forkId)
  if (!fork) {
    console.log('Wrong forkId')
    return
  }
  const root = fork.global_head
  if (!root) {
    console.log('Nothing has been deployed on fork')
    return
  }

  const apiPathVerify = `/api/v1/account/${yamlData.username}/project/${tenderlyProject}/fork/${forkId}/verify`

  for (const request of requests) {
    try {
      const payload = { ...request, root }
      const response = await tenderlyApi.post(apiPathVerify, payload)
      const responseData = response.data
      // console.log(JSON.stringify(responseData, undefined, 2))

      if (responseData.bytecode_mismatch_errors != null) {
        console.log('BYTECODE_MISMATCH_ERROR')
        return
      }

      if (!responseData.contracts?.length) {
        let addresses = ''
        for (const cont of request.contracts) {
          addresses += cont.contractName + ', '
        }

        console.log('NO_NEW_CONTRACTS_VERIFIED_ERROR', addresses)
        return
      }

      for (const contract of responseData.contracts) {
        console.log(`Contract ${contract.contract_name} (${contract.address}) verified.`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  console.log('Done')
}

export const fork = async (hre: HardhatRuntimeEnvironment) => {
  const networkName = hre.network.name
  console.log(`Forking ${networkName}`)
  const chainId = (hre as any).network.config.chainId.toString() as string
  const yamlData = getTenderlyConfig()
  const tenderlyProject = getTenderlyProject(hre)
  const forks = await getForks(yamlData.username, tenderlyProject)
  for (const fork of forks) {
    if (fork.alias === networkName) {
      console.log(`Fork for "${networkName}" has already existed`)
      return
    }
  }

  const createRequest = {
    alias: networkName,
    network_id: chainId.slice(PREFIX.length),
    chain_config: {
      chain_id: parseInt(chainId),
    },
  }

  const tenderlyApi = getTenderlyApi()

  const api = `/api/v1/account/${yamlData.username}/project/${tenderlyProject}/fork`
  const response = await tenderlyApi.post<{
    simulation_fork: {
      id: string
    }
  }>(api, createRequest)

  const forkId = response.data.simulation_fork.id
  console.log(`\t${networkName}: "${TENDERLY_RPC_BASE}/fork/${forkId}"`)

  console.log('Done')
}

export const forks = async (hre: HardhatRuntimeEnvironment) => {
  const yamlData = getTenderlyConfig()
  const tenderlyProject = getTenderlyProject(hre)
  const forks = await getForks(yamlData.username, tenderlyProject)

  console.log('{')
  for (const fork of forks) {
    console.log(`\t${fork.alias}: "${TENDERLY_RPC_BASE}/fork/${fork.id}",`)
  }
  console.log('}')
}

export const accounts = async (hre: HardhatRuntimeEnvironment) => {
  console.log('Printing accounts...')
  const yamlData = getTenderlyConfig()
  const tenderlyProject = getTenderlyProject(hre)
  const forkId = getForkId(hre)
  console.log({ forkId })
  const api = `/api/v1/account/${yamlData.username}/project/${tenderlyProject}/fork/${forkId}`
  const tenderlyApi = getTenderlyApi()
  try {
    const response = await tenderlyApi.get<Fork>(api)
    const accounts = response.data.simulation_fork.accounts
    for (const account in accounts) console.log(`${account}: ${accounts[account]}`)
  } catch (e) {
    console.error(e)
  }
}

export const checkpoint = async (hre: HardhatRuntimeEnvironment) => {
  const snapshot = await hre.time.snapshot()
  console.log('Snapshot:', snapshot)
}
