import { ContractFactory } from 'ethers'
import { DeployFunction, DeployOptions } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { ChainTag, chainIds, RemoteType } from './misc'
import { node, types, Types } from './node'
import { config } from '@/gotbit.config'
import process, { exit } from 'process'

const realChainConfigs = {
  localhost: {},
  eth_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.ETH,
  },
  rinkeby: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.ETH,
  },
  ropsten: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.ETH,
  },
  goerli: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.ETH,
  },
  bsc_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.BSC,
  },
  bsc_testnet: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.BSC,
  },
  polygon_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.POLYGON,
  },
  polygon_testnet: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.POLYGON,
  },
  avax_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.AVAX,
  },
  avax_testnet: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.AVAX,
  },
  ftm_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.FTM,
  },
  ftm_testnet: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.FTM,
  },
  arbitrum_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.ARBITRUM,
  },
  arbitrum_testnet: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.ARBITRUM,
  },
  celo_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.CELO,
  },
  celo_alfajores_testnet: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.CELO,
  },
  pulse_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.PULSE,
  },

  metis_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.METIS,
  },
  metis_testnet: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.METIS,
  },
  cube_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.CUBE,
  },
  cube_testnet: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.CUBE,
  },

  cmp_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.CMP,
  },
  cmp_testnet: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.CMP,
  },

  okex_mainnet: {
    keys: config.PRIVATE?.MAIN,
    api: config.API?.OKEX,
  },
  okex_testnet: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.OKEX,
  },

  pulse_testnet: {
    keys: config.PRIVATE?.TEST,
    api: config.API?.PULSE,
  },
}

const genConfig = <Type extends RemoteType>(t: Type, privates?: string[]) => {
  type Filter<A, B> = A extends B ? A : never
  const config = {} as {
    [key in Filter<keyof typeof realChainConfigs, string> as `${key}_${Type}`]: {
      keys?: string[]
    }
  }
  for (const tag in realChainConfigs) {
    ;(config as any)[tag + '_' + t] = {
      keys: privates,
    }
  }
  return config
}

const parseConfig = (): {
  chains: Record<ChainTag, { keys?: string[]; api?: string }>
} => {
  return {
    chains: {
      ...realChainConfigs,
      ...genConfig('dev', config.PRIVATE?.remote.DEV),
      ...genConfig('test', config.PRIVATE?.remote.TEST),
      ...genConfig('qa', config.PRIVATE?.remote.QA),
    },
  }
}

export const genNetworks = () => {
  const networks = {} as { [key: string]: Object }
  const parsedConfig = parseConfig()

  for (const name of Object.keys(chainIds) as ChainTag[]) {
    if (parsedConfig.chains[name] === undefined) continue
    if (name === 'localhost') continue

    networks[name] = {
      chainId: node(name).chainId,
      url: node(name).rpc ?? '',
      accounts: parsedConfig.chains[name].keys,
      tags: [types[name]],
      deploy: [`deploy/${types[name]}/`],
      verify: {
        etherscan: {
          apiKey: parsedConfig.chains[name].api,
        },
      },
    }
  }

  return networks
}

export const genCompilers = (vers: string[]) =>
  vers.map((v) => ({
    version: v,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  }))

export const wrapperHRE = (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre
  const deploy = <Factory extends ContractFactory>(
    name: string,
    options: Omit<DeployOptions, 'args'> | { args: Parameters<Factory['deploy']> }
  ) => deployments.deploy(name, options as DeployOptions)
  return { ...hre, deploy }
}

export const exceptTypes = (...tags: Types[]) => {
  if (tags.length === 0) return async () => true
  return async (hre: HardhatRuntimeEnvironment) =>
    tags.some((tag) => !hre.network.tags[tag])
}

export const setup = (name: string, func: DeployFunction): DeployFunction => {
  return async (hre) => {
    process.stdout.write(`setuping "${name}" ... `)
    await func(hre)
    console.log(`setuped`)
  }
}

export const run = (name: string, f?: (...a: any) => Promise<any>) => {
  if (!f) {
    console.assert(false, 'Not implemented yet')
    exit(1)
  }

  process.stdout.write(`executing "${name}" ... `)
  f()
    .then(() => console.log('done'))
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
