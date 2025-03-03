import { config } from '@/gotbit.config'
import { chainIds, RealChainTag, toRemote } from './misc'

import type { ChainTag } from './misc'

export interface Config {
  name: string
  rpc: string
  chainId: number
  symbol: string
  scanner: string
}

export interface Node {
  short: string
  name: string
  scanner: string
  rpc: string
  chainId: number
  type: Types
}

export type Types =
  | 'mainnet'
  | 'testnet'
  | 'fork'
  | 'remote/mainnet'
  | 'remote/testnet'
  | 'remote/localhost'
  | 'localhost'

export const realTypes: Record<RealChainTag, Types> = {
  localhost: 'localhost',

  eth_mainnet: 'mainnet',
  bsc_mainnet: 'mainnet',
  polygon_mainnet: 'mainnet',
  avax_mainnet: 'mainnet',
  ftm_mainnet: 'mainnet',
  arbitrum_mainnet: 'mainnet',
  celo_mainnet: 'mainnet',
  metis_mainnet: 'mainnet',
  cube_mainnet: 'mainnet',
  okex_mainnet: 'mainnet',
  cmp_mainnet: 'mainnet',
  pulse_mainnet: 'mainnet',
  base_mainnet: 'mainnet',
  bitlayer_mainnet: 'mainnet',
  xend_mainnet: 'mainnet',

  rinkeby: 'testnet',
  ropsten: 'testnet',
  goerli: 'testnet',
  bsc_testnet: 'testnet',
  polygon_testnet: 'testnet',
  avax_testnet: 'testnet',
  ftm_testnet: 'testnet',
  arbitrum_testnet: 'testnet',
  celo_alfajores_testnet: 'testnet',
  metis_testnet: 'testnet',
  cube_testnet: 'testnet',
  okex_testnet: 'testnet',
  cmp_testnet: 'testnet',
  pulse_testnet: 'testnet',
  xend_testnet: 'testnet',
  arbitrum_sepolia: 'testnet',
  base_sepolia: 'testnet',
  eth_sepolia: 'testnet',
  polygon_amoy: 'testnet',
  bitlayer_testnet: 'testnet',
}
export const realNames: Record<RealChainTag, string> = {
  localhost: 'Localhost',

  eth_mainnet: 'Ethereum',
  bsc_mainnet: 'BNB Chain',
  polygon_mainnet: 'Polygon Mainnet',
  avax_mainnet: 'Avalanche Mainnet',
  ftm_mainnet: 'Fantom Mainnet',
  arbitrum_mainnet: 'Arbitrum Mainnet',
  celo_mainnet: 'Celo Mainnet',
  metis_mainnet: 'Metis Andromeda Mainnet',
  cube_mainnet: 'Cube Chain Mainnet',
  okex_mainnet: 'OKExChain Mainnet',
  cmp_mainnet: 'CMP Mainnet',
  pulse_mainnet: 'PulseChain Mainnet',
  base_mainnet: 'Base',
  bitlayer_mainnet: 'BitLayer Mainnet',
  xend_mainnet: 'Asset Chain Mainnet',

  rinkeby: 'Rinkeby',
  ropsten: 'Ropsten',
  goerli: 'Goerli',
  bsc_testnet: 'BNB Chain Testnet',
  polygon_testnet: 'Polygon Mumbai Testnet',
  avax_testnet: 'Avalanche Fuji Testnet',
  ftm_testnet: 'Fantom Testnet',
  arbitrum_testnet: 'Arbitrum Testnet',
  celo_alfajores_testnet: 'Celo Alfajores Testnet',
  metis_testnet: 'Metis Stardust Testnet',
  cube_testnet: 'Cube Chain Testnet',
  okex_testnet: 'OKExChain Testnet',
  cmp_testnet: 'CMP Testnet',
  pulse_testnet: 'PulseChain Testnet',
  xend_testnet: 'Xend Testnet',
  arbitrum_sepolia: 'Arbitrum Sepolia Testnet',
  base_sepolia: 'Base Sepolia Testnet',
  eth_sepolia: 'Sepolia',
  polygon_amoy: 'Amoy',
  bitlayer_testnet: 'BitLayer Testnet',
}
export const realSymbols: Record<RealChainTag, string> = {
  localhost: 'LOC',

  eth_mainnet: 'ETH',
  bsc_mainnet: 'BNB',
  polygon_mainnet: 'MATIC',
  avax_mainnet: 'AVAX',
  ftm_mainnet: 'FTM',
  arbitrum_mainnet: 'ETH',
  celo_mainnet: 'CELO',
  metis_mainnet: 'METIS',
  cube_mainnet: 'CUBE',
  okex_mainnet: 'OKT',
  cmp_mainnet: 'CMP',
  pulse_mainnet: 'PLS',
  base_mainnet: 'ETH',
  bitlayer_mainnet: 'BTC',
  xend_mainnet: 'RWA',

  rinkeby: 'ETH',
  ropsten: 'ETH',
  goerli: 'ETH',
  bsc_testnet: 'BNB',
  polygon_testnet: 'MATIC',
  avax_testnet: 'AVAX',
  ftm_testnet: 'FTM',
  arbitrum_testnet: 'ETH',
  celo_alfajores_testnet: 'CELO',
  metis_testnet: 'METIS',
  cube_testnet: 'CUBE',
  okex_testnet: 'OKT',
  cmp_testnet: 'CMP',
  pulse_testnet: 'PLS',
  xend_testnet: 'RWA',
  arbitrum_sepolia: 'ETH',
  base_sepolia: 'ETH',
  eth_sepolia: 'ETH',
  polygon_amoy: 'MATIC',
  bitlayer_testnet: 'BTC'
}

export const types: Record<ChainTag, Types> = {
  ...realTypes,
  ...toRemote(realTypes, 'remote/', 'dev'),
  ...toRemote(realTypes, 'remote/', 'test'),
  ...toRemote(realTypes, 'remote/', 'qa'),
}

export const names: Record<ChainTag, string> = {
  ...realNames,
  ...toRemote(realNames, 'DEV ', 'dev'),
  ...toRemote(realNames, 'TEST ', 'test'),
  ...toRemote(realNames, 'QA ', 'qa'),
}

export const symbols: Record<ChainTag, string> = {
  ...realSymbols,
  ...toRemote(realSymbols, '', 'dev'),
  ...toRemote(realSymbols, '', 'test'),
  ...toRemote(realSymbols, '', 'qa'),
}

export const scanners: Record<RealChainTag, string> = {
  localhost: '/',
  eth_mainnet: 'https://etherscan.io/',
  bsc_mainnet: 'https://bscscan.com/',
  polygon_mainnet: 'https://polygonscan.com/',
  avax_mainnet: 'https://snowtrace.io/',
  ftm_mainnet: 'https://ftmscan.com/',
  arbitrum_mainnet: 'https://arbiscan.io/',
  celo_mainnet: 'https://celoscan.io/',
  metis_mainnet: 'https://andromeda-explorer.metis.io/',
  cube_mainnet: 'https://www.cubescan.network/',
  okex_mainnet: 'https://www.oklink.com/en/okc/',
  cmp_mainnet: 'https://mainnet.scan.caduceus.foundation/',
  pulse_mainnet: 'https://scan.mypinata.cloud/ipfs/bafybeih3olry3is4e4lzm7rus5l3h6zrphcal5a7ayfkhzm5oivjro2cp4/#/',
  base_mainnet: 'https://basescan.org/',
  bitlayer_mainnet: 'https://www.btrscan.com/',
  xend_mainnet: 'https://scan.assetchain.org/',

  rinkeby: 'https://rinkeby.etherscan.io/',
  ropsten: 'https://ropsten.etherscan.io/',
  goerli: 'https://goerli.etherscan.io/',
  bsc_testnet: 'https://testnet.bscscan.com/',
  polygon_testnet: 'https://mumbai.polygonscan.com/',
  avax_testnet: 'https://testnet.snowtrace.io/',
  ftm_testnet: 'https://testnet.ftmscan.com/',
  arbitrum_testnet: 'https://testnet.arbiscan.io/',
  celo_alfajores_testnet: 'https://alfajores.celoscan.io/',
  metis_testnet: 'https://stardust-explorer.metis.io/',
  cube_testnet: 'https://testnet.cubescan.network/',
  okex_testnet: 'https://www.oklink.com/en/okc-test/',
  cmp_testnet: 'https://galaxy.scan.caduceus.foundation/',
  pulse_testnet: 'https://scan.v4.testnet.pulsechain.com',
  xend_testnet: 'https://testnet.xendrwachain.com/',
  arbitrum_sepolia: 'https://sepolia.arbiscan.io/',
  base_sepolia: 'https://public.stackup.sh/api/v1/node/base-sepolia',
  eth_sepolia: 'https://ethereum-sepolia-rpc.publicnode.com',
  polygon_amoy: 'https://polygon-amoy-bor-rpc.publicnode.com',
  bitlayer_testnet: 'https://testnet-scan.bitlayer.org/'
}

export function node(name: ChainTag): Node {
  if (name === 'localhost') {
    return {
      rpc: 'http://127.0.0.1:8545/',
      chainId: chainIds[name],
      scanner: scanners[name],
      name: names[name],
      short: name,
      type: types[name],
    }
  }
  if (Object.keys(names).includes(name)) {
    return {
      rpc: config.rpc(name),
      chainId: chainIds[name],
      scanner: (scanners as any)[name] ?? '',
      name: names[name],
      short: name,
      type: types[name],
    }
  }

  return {} as Node
}

export function getConfig(name: ChainTag): Config {
  if (Object.keys(names).includes(name)) {
    return {
      name: names[name],
      rpc: config.rpc(name),
      chainId: chainIds[name],
      symbol: symbols[name],
      scanner: (scanners as any)[name] ?? '',
    }
  }

  return {} as Config
}

export const extraRpcs: Record<RealChainTag, string[]> = {
  localhost: ['http://127.0.0.1:8545/'],

  eth_mainnet: ['https://rpc.ankr.com/eth'],
  bsc_mainnet: [
    'https://bsc-dataseed1.binance.org/',
    'https://bsc-dataseed2.binance.org/',
    'https://bsc-dataseed3.binance.org/',
    'https://bsc-dataseed4.binance.org/',
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc-dataseed2.defibit.io/',
    'https://bsc-dataseed3.defibit.io/',
    'https://bsc-dataseed4.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',
    'https://bsc-dataseed2.ninicoin.io/',
    'https://bsc-dataseed3.ninicoin.io/',
    'https://bsc-dataseed4.ninicoin.io/',
    'https://rpc.ankr.com/bsc',
  ],
  polygon_mainnet: ['https://polygon-rpc.com', 'https://rpc.ankr.com/polygon'],
  avax_mainnet: [
    'https://api.avax.network/ext/bc/C/rpc',
    'https://rpc.ankr.com/avalanche',
  ],
  ftm_mainnet: ['https://rpc.ftm.tools', 'https://rpc.ankr.com/fantom'],
  arbitrum_mainnet: ['https://arb1.arbitrum.io/rpc', 'https://rpc.ankr.com/arbitrum'],
  celo_mainnet: ['https://rpc.ankr.com/celo'],
  metis_mainnet: ['https://andromeda.metis.io/?owner=1088'],
  cube_mainnet: ['https://http-mainnet.cube.network'],
  okex_mainnet: ['https://exchainrpc.okex.org/'],
  cmp_mainnet: ['https://mainnet.block.caduceus.foundation'],
  pulse_mainnet: ['https://pulsechain.publicnode.com'],
  base_mainnet: ['https://base-rpc.publicnode.com'],
  bitlayer_mainnet: ['https://rpc-bitlayer.rockx.com'],
  xend_mainnet: ['https://mainnet-rpc.assetchain.org'],

  rinkeby: ['https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  ropsten: ['https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  goerli: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  bsc_testnet: [
    // 'https://bsctestapi.terminet.io/rpc',
    'https://data-seed-prebsc-1-s1.binance.org:8545/',
    'https://data-seed-prebsc-2-s1.binance.org:8545/',
    'http://data-seed-prebsc-1-s2.binance.org:8545/',
    'http://data-seed-prebsc-2-s2.binance.org:8545/',
    'https://data-seed-prebsc-1-s3.binance.org:8545/',
    'https://data-seed-prebsc-2-s3.binance.org:8545/',
  ],
  polygon_testnet: ['https://rpc-mumbai.maticvigil.com'],
  avax_testnet: ['https://api.avax-test.network/ext/bc/C/rpc'],
  ftm_testnet: ['https://rpc.testnet.fantom.network/'],
  arbitrum_testnet: ['https://rinkeby.arbitrum.io/rpc'],

  celo_alfajores_testnet: ['https://alfajores-forno.celo-testnet.org'],
  metis_testnet: ['https://stardust.metis.io/?owner=588'],
  cube_testnet: ['https://http-testnet.cube.network'],
  okex_testnet: ['https://exchaintestrpc.okex.org'],
  cmp_testnet: ['https://galaxy.block.caduceus.foundation	'],
  pulse_testnet: ['https://rpc.v4.testnet.pulsechain.com'],
  xend_testnet: [
    'https://enugu-rpc.assetchain.org',
  ],
  arbitrum_sepolia: ['https://api.zan.top/arb-sepolia', `https://sepolia-rollup.arbitrum.io/rpc`,],
  /**
   * chainId 11155111
   */
  eth_sepolia: [
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://1rpc.io/sepolia',
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://endpoints.omniatech.io/v1/eth/sepolia/public',
  ],
  /**
   * 80002
   */
  polygon_amoy: [
    'https://rpc-amoy.polygon.technology',
    'https://polygon-amoy.drpc.org'
  ],

  /**
   * 84532
   */
  base_sepolia: [
    'https://base-sepolia-rpc.publicnode.com',
    'https://sepolia.base.org'
  ],
  bitlayer_testnet: ['https://testnet-rpc.bitlayer.org']
}
