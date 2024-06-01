import {
  TenderlyContract,
  TenderlyContractConfig,
  TenderlyKeyConfig,
} from 'hardhat-deploy-tenderly/dist/src/tenderly/types'
import { Deployment, DeploymentsExtension } from 'hardhat-deploy/types'
import { ActionType, HardhatRuntimeEnvironment } from 'hardhat/types'
import { basename } from 'path'
import path from 'path'
import fs from 'fs'
import { homedir } from 'os'
import * as yaml from 'js-yaml'
import axios from 'axios'
import { Fork, Forks, SimulationFork } from './types'
import { task } from 'hardhat/config'

export const TENDERLY_API_BASE_URL = 'https://api.tenderly.co'
export const TENDERLY_DASHBOARD_BASE_URL = 'https://dashboard.tenderly.co'
export const TENDERLY_RPC_BASE = 'https://rpc.tenderly.co'

export const PREFIX = '10000'

type Doc = { kind: string; methods: any; version: number }
type Source = { content: string; keccak256: string; license: string }
type Metadata = {
  compiler: {
    version: string
  }
  language: string
  output: { abi: any[]; devdoc: Doc; userdoc: Doc }
  settings: {
    compilationTarget: Record<string, string>
    evmVersion: string
    libraries: Record<string, string>
    metadata: {
      bytecodeHash: string
      useLiteralContent: boolean
    }
    optimizer: {
      enabled: boolean
      runs: number
    }
    remappings: any[]
  }
  sources: Record<string, Source>
  version: number
}

export function getDeployments(
  hre: HardhatRuntimeEnvironment
): Promise<{ [name: string]: Deployment }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deploymentExtension: DeploymentsExtension | undefined = (hre as any).deployments
  if (!deploymentExtension) {
    throw new Error('This plugin depends on hardhat-deploy plugin')
  }
  return deploymentExtension.all()
}

export const getTenderlyConfig = () => {
  const filepath = path.join(homedir(), '.tenderly', 'config.yaml')
  const fileData = fs.readFileSync(filepath)
  const yamlData = yaml.load(fileData.toString()) as TenderlyKeyConfig & {
    username: string
    head?: string
  }
  if (yamlData.access_key == null) {
    throw new Error('Not key')
  }
  return yamlData
}

export const getTenderlyApi = () => {
  const yamlData = getTenderlyConfig()
  return axios.create({
    baseURL: TENDERLY_API_BASE_URL,
    headers: {
      'x-access-key': yamlData.access_key,
    },
  })
}

export const getTenderlyApiRpc = () => {
  const yamlData = getTenderlyConfig()
  return axios.create({
    baseURL: TENDERLY_RPC_BASE,
    headers: {
      'x-access-key': yamlData.access_key,
      Head: yamlData.head !== undefined ? yamlData.head : '',
    },
  })
}

export const getTenderlyProject = (hre: HardhatRuntimeEnvironment) => {
  const tenderlyProject = hre.config.tenderly?.project
  if (!tenderlyProject) throw new Error('Not tenderly project name in config')

  console.log(`Tenderly project ${tenderlyProject}`)
  return tenderlyProject
}

export const getForkId = (hre: HardhatRuntimeEnvironment): string => {
  const rpc = (hre.network.config as any).url
  const forkId = rpc.split('/')[rpc.split('/').length - 1]
  return forkId
}

export const getRequests = async (hre: HardhatRuntimeEnvironment, forkId?: string) => {
  const deployments = await getDeployments(hre)
  const chainId = (await (hre as any).getChainId()) as string
  const requests: {
    config: TenderlyContractConfig
    contracts: TenderlyContract[]
    name: string
  }[] = []

  for (const deploymentName of Object.keys(deployments)) {
    if (deploymentName.endsWith('_Proxy')) {
      continue
    }

    const deployment = deployments[deploymentName]

    let name = deploymentName
    if (deployment.numDeployments && deployment.numDeployments > 1) {
      name = deploymentName + '_' + deployment.numDeployments.toString().padStart(3, '0')
    }

    if (deployment.metadata) {
      const metadata = JSON.parse(deployment.metadata) as Metadata
      console.log(`Processing "${deploymentName}"...`)
      const compilationTargets = Object.keys(metadata.settings.compilationTarget)
      const tenderlyContracts: TenderlyContract[] = []
      for (let i = 0; i < compilationTargets.length; i++) {
        const key = compilationTargets[i]

        const target = metadata.settings.compilationTarget[key]
        const sourcePath = key
        tenderlyContracts.push({
          contractName: target,
          source: metadata.sources[sourcePath].content,
          sourcePath,
          compiler: {
            version: metadata.compiler.version,
          },
          networks: {
            [forkId ?? chainId]: {
              display_name: name,
              address: deployment.address,
              transactionHash: deployment.receipt?.transactionHash,
            },
          },
        })
        for (const sourcePath of Object.keys(metadata.sources)) {
          if (sourcePath === key) {
            continue
          }
          let contractName = basename(sourcePath)
          if (contractName.endsWith('.sol')) {
            contractName = contractName.slice(0, contractName.length - 4)
          }
          tenderlyContracts.push({
            contractName: `${target}:${contractName}`, // works ?
            source: metadata.sources[sourcePath].content,
            sourcePath,
            compiler: {
              version: metadata.compiler.version,
            },
          })
        }
      }

      const tenderlySolcConfig: TenderlyContractConfig = {}
      tenderlySolcConfig.compiler_version = metadata.compiler.version
      tenderlySolcConfig.optimizations_used = metadata.settings.optimizer.enabled
      tenderlySolcConfig.optimizations_count = metadata.settings.optimizer.runs
      tenderlySolcConfig.evm_version = metadata.settings.evmVersion

      requests.push({
        config: tenderlySolcConfig,
        contracts: tenderlyContracts,
        name: deploymentName,
      })
    } else {
      console.log(`skip "${deploymentName}" as no metadata was found`)
    }
  }
  return requests
}

export async function getForks(username: string, project: string) {
  const tenderlyApi = getTenderlyApi()

  const api = `/api/v1/account/${username}/project/${project}/forks`

  try {
    const response = await tenderlyApi.get<Forks>(api)
    return response.data.simulation_forks
  } catch (e) {
    console.log('Cant get forks info')
    return []
  }
}

export async function getFork(username: string, project: string, forkId: string) {
  const tenderlyApi = getTenderlyApi()

  const api = `/api/v1/account/${username}/project/${project}/fork/${forkId}`

  try {
    const response = await tenderlyApi.get<Fork>(api)
    return response.data.simulation_fork
  } catch (e) {
    console.log('Cant get forks info')
    return null
  }
}

export const tenderlyTask = <ArgsT extends unknown>(
  name: string,
  description?: string,
  action?: ActionType<ArgsT>
) => {
  task(`tenderly:${name}`, description, action)
}
