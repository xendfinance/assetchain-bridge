import { ChainTag, RemoteChainTag, RpcFunction } from './utils/misc'
import { extraRpcs } from './utils/node'

export const ankrRpc = (): RpcFunction => {
  const ankrPath: Partial<Record<ChainTag, string>> = {
    avax_mainnet: '/avalanche',
    bsc_mainnet: '/bsc',
    arbitrum_mainnet: '/arbitrum',
    eth_mainnet: '/eth',
    ftm_mainnet: '/fantom',
    polygon_mainnet: '/polygon',
    celo_mainnet: '/celo',

    avax_testnet: '/avalanche_fuji',
    polygon_testnet: '/polygon_mumbai',
    ftm_testnet: '/fantom_testnet',
    rinkeby: '/eth_rinkeby',
    ropsten: '/eth_ropsten',
    goerli: '/eth_goerli',
  }
  return (chainTag: ChainTag) => {
    if (chainTag === 'pulse_mainnet') return 'https://pulsechain.publicnode.com'
    if (chainTag === 'pulse_testnet') return 'https://rpc.v4.testnet.pulsechain.com'
    if (chainTag === 'base_mainnet') return 'https://base-rpc.publicnode.com'
    if (chainTag === 'arbitrum_sepolia') return 'https://public.stackup.sh/api/v1/node/arbitrum-sepolia'
    if (chainTag === 'xend_testnet') return 'https://rpctestnet.xendrwachain.com'
    if (chainTag === 'eth_sepolia') return 'https://ethereum-sepolia-rpc.publicnode.com'
    if (chainTag === 'polygon_amoy') return 'https://rpc-amoy.polygon.technology'
    if (chainTag === 'base_sepolia') return 'https://rpc.notadegen.com/base/sepolia'

    if (chainTag === 'avax_testnet')
      return 'https://avalanche-fuji-c-chain.publicnode.com'

    return 'https://rpc.ankr.com' + ankrPath[chainTag] ?? ''
  }
}

const goodRpcProvider = [ankrRpc()]

export const extraRpc = (indexes?: Partial<Record<ChainTag, number>>) => {
  return (chainTag: ChainTag) => {
    let index = 0
    if (indexes) {
      const possibleIndex = indexes[chainTag]
      if (possibleIndex !== undefined) index = possibleIndex
    }

    const rpcList = (extraRpcs as any)[chainTag] ?? []

    for (const goodRpc of goodRpcProvider) {
      const rpc = goodRpc(chainTag)
      if (rpc) rpcList.push(rpc)
    }

    return index < rpcList.length ? rpcList[index] : ''
  }
}

export const universalRpc = (): RpcFunction => {
  const ankr = ankrRpc()
  return (chainTag: ChainTag) => {
    const a: Record<ChainTag, string> = {
      avax_mainnet: ankr(chainTag),
      bsc_mainnet: ankr(chainTag),
      arbitrum_mainnet: ankr(chainTag),
      eth_mainnet: ankr(chainTag),
      ftm_mainnet: ankr(chainTag),
      polygon_mainnet: ankr(chainTag),
      celo_mainnet: ankr(chainTag),
      base_mainnet: ankr(chainTag),

      avax_testnet: 'https://avalanche-fuji-c-chain.publicnode.com',
      polygon_testnet: 'https://rpc-mumbai.maticvigil.com',
      ftm_testnet: ankr(chainTag),
      rinkeby: ankr(chainTag),
      ropsten: ankr(chainTag),
      goerli: ankr(chainTag),

      arbitrum_testnet: extraRpcs.arbitrum_testnet[0],
      // bsc_testnet: extraRpcs.bsc_testnet[0],
      bsc_testnet: 'https://bsc-testnet.publicnode.com',

      localhost: extraRpcs.localhost[0],

      metis_mainnet: extraRpcs.metis_mainnet[0],
      cube_mainnet: extraRpcs.cube_mainnet[0],
      okex_mainnet: extraRpcs.okex_mainnet[0],
      cmp_mainnet: extraRpcs.cmp_mainnet[0],
      pulse_mainnet: 'https://pulsechain.publicnode.com',

      celo_alfajores_testnet: extraRpcs.celo_alfajores_testnet[0],
      metis_testnet: extraRpcs.metis_testnet[0],
      cube_testnet: extraRpcs.cube_testnet[0],
      okex_testnet: extraRpcs.okex_testnet[0],
      cmp_testnet: extraRpcs.cmp_testnet[0],
      pulse_testnet: 'https://rpc.v4.testnet.pulsechain.com',
      arbitrum_sepolia: extraRpcs.arbitrum_sepolia[0],
      xend_testnet: extraRpcs.xend_testnet[0],
      base_sepolia: extraRpcs.base_sepolia[0],
      eth_sepolia: extraRpcs.eth_sepolia[0],
      polygon_amoy: extraRpcs.polygon_amoy[0],
    } as any
    return a[chainTag]
  }
}

export const toRealChainTag = (chainTag: ChainTag) => {
  return process.env.MODE ? chainTag + '_' + process.env.MODE : chainTag
}

export const remoteRpc = (tags: Partial<Record<RemoteChainTag, string>>): RpcFunction => {
  return (chainTag: ChainTag) => {
    const remote = tags[chainTag as RemoteChainTag]
    if (remote) return remote
    return universalRpc()(chainTag)
  }
}
