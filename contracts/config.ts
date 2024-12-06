export interface IBridgedTokenParams {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  isLockActive: boolean
  tokenOriginal: string
  chainIdOriginal: number
}

export interface IDefaultTokenParams {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
}

export const CHAIN_IDS = {
  assetChain: 42421,
  arbitrum: 421614,
  polygon: 80002,
  ethereum: 11155111,
  bsc: 97,
  base: 84532,
  bitlayer: 200810
}

export const MAINNET_CHAIN_IDS = {
  assetChain: 42420,
  arbitrum: 42161,
  polygon: 137,
  ethereum: 1,
  bsc: 56,
  base: 8453,
  bitlayer: 200901
}

export const DEFAULT_NATIVE_TOKEN_CONTRACT =
  '0x0000000000000000000000000000000000000001'

export const DEFAULT_TOKEN_PARAMS: {
  [chainId: number]: { [token: string]: IDefaultTokenParams }
} = {
  84532: {
    USDT: {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6, // @todo CAN'T FIND USDT ON BASE
      totalSupply: '51998658367', // @todo CAN'T FIND USDT ON BASE
    },
    USDC: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      totalSupply: '2937691509',
    },
    aUSDCe: {
      name: 'Test aUSDCe',
      symbol: 'aUSDC.e',
      decimals: 6,
      totalSupply: '2937691509',
    },
  },
  97: {
    USDT: {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6, // 18!
      totalSupply: '3979997892',
    },
    USDC: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6, // 18!
      totalSupply: '548999999',
    },
    DAI: {
      name: 'DAI Coin',
      symbol: 'DAI',
      decimals: 18, // 18!
      totalSupply: '200000',
    },
  },
  11155111: {
    USDT: {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      totalSupply: '51998658367',
    },
    USDC: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      totalSupply: '24602219992',
    },
  },
  80002: {
    USDT: {
      name: '(PoS) Tether USD',
      symbol: 'USDT',
      decimals: 6,
      totalSupply: '892496732',
    },
    USDC: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      totalSupply: '240705109',
    },
    WNT: {
      name: 'Wicrypt Network Token',
      symbol: 'WNT',
      decimals: 18,
      totalSupply: '200000000',
    },
  },
  421614: {
    USDT: {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      totalSupply: '2309817488',
    },
    USDC: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      totalSupply: '1190813493',
    },
    WNT: {
      name: 'Wicrypt Network Token',
      symbol: 'WNT',
      decimals: 18,
      totalSupply: '200000000',
    },
    RWA: {
      name: 'Xend Real World Asset',
      symbol: 'RWA',
      decimals: 18,
      totalSupply: '200000000',
    },
    WETH: {
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      totalSupply: '190246',
    },
    DAI: {
      name: 'DAI Coin',
      symbol: 'DAI',
      decimals: 6,
      totalSupply: '200000',
    },
  },
  200810: {
    WBTC: {
      name: 'Wrapped Bitlayer BTC',
      symbol: 'WBTC',
      decimals: 18,
      totalSupply: '20000000',
    },
  }
}

// export const BRIDGED_TOKEN_PARAMS: {
//   [chainId: number]: { [token: string]: IBridgedTokenParams }
// } = {
//   42421: {
//     WETH: {
//       name: 'Wrapped Ether',
//       symbol: 'WETH',
//       decimals: 18,
//       totalSupply: '0',
//       isLockActive: false,
//       tokenOriginal: '0x2F633a89Cf5cd1269b71F095265d708e65d56B89',
//       chainIdOriginal: CHAIN_IDS.arbitrum,
//     },
//     WNT: {
//       name: 'Wicrypt Network Token',
//       symbol: 'WNT',
//       decimals: 18,
//       totalSupply: '0',
//       isLockActive: false,
//       tokenOriginal: '0xE8975a94296e3A473c1731E09d687Dda8c437309',
//       chainIdOriginal: CHAIN_IDS.polygon,
//     },
//     USDT: {
//       name: 'Tether USD',
//       symbol: 'USDT',
//       decimals: 6,
//       totalSupply: '0',
//       isLockActive: true,
//       tokenOriginal: '0x6cb8C82DaB692a708D0bbB533aa6A709d4CE6dCA',
//       chainIdOriginal: CHAIN_IDS.ethereum,
//     },
//     USDC: {
//       name: 'USD Coin',
//       symbol: 'USDC',
//       decimals: 6,
//       totalSupply: '0',
//       isLockActive: true,
//       tokenOriginal: '0x58B202B9650b4e55D9F3f573c25b2930Ba16d0B2',
//       chainIdOriginal: CHAIN_IDS.ethereum,
//     },
//   },
// }

export const BRIDGED_TOKEN_PARAMS: {
  [chainId: number]: { [token: string]: IBridgedTokenParams }
} = {
  42421: {
    WETH: {
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      totalSupply: '0',
      isLockActive: false,
      tokenOriginal: '0xd5Ed38f9f619e25130FeD45bb7052E8CcDd2bd51',
      chainIdOriginal: CHAIN_IDS.arbitrum,
    },
    WNT: {
      name: 'Wicrypt Network Token',
      symbol: 'WNT',
      decimals: 18,
      totalSupply: '0',
      isLockActive: false,
      tokenOriginal: '0x5FE56E863d5C4564CF33F4BB35b6d24e246f7157',
      chainIdOriginal: CHAIN_IDS.arbitrum,
    },
    USDT: {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      totalSupply: '0',
      isLockActive: true,
      tokenOriginal: '0x4192E781452601757D1D5C88c88b9e4F59453463',
      chainIdOriginal: CHAIN_IDS.bsc,
    },
    USDC: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      totalSupply: '0',
      isLockActive: true,
      tokenOriginal: '0xeAEDBCf842D4B7F198a552e385fc69AB886fCD46',
      chainIdOriginal: CHAIN_IDS.bsc,
    },
    DAI: {
      name: 'DAI Coin',
      symbol: 'DAI',
      decimals: 6,
      totalSupply: '0',
      isLockActive: true,
      tokenOriginal: '0x4BCf919e7B32c7e0a8a4fe08F40928fAd5d57b40',
      chainIdOriginal: CHAIN_IDS.arbitrum,
    },
    WBTC: {
      name: 'Wrapped Bitlayer BTC',
      symbol: 'WBTC',
      decimals: 18,
      totalSupply: '0',
      isLockActive: true,
      tokenOriginal: '0x3095A7217Cda6EEc1E6BEdACb56974431f2B3623',
      chainIdOriginal: CHAIN_IDS.bitlayer,
    },
  },
}

export const MAINNET_BRIDGED_TOKEN_PARAMS: {
  [chainId: number]: { [token: string]: IBridgedTokenParams }
} = {
  42420: {
    WNT: {
      name: 'Wicrypt Network Token',
      symbol: 'WNT',
      decimals: 18,
      totalSupply: '0',
      isLockActive: false,
      tokenOriginal: '0xAD4b9c1FbF4923061814dD9d5732EB703FaA53D4',
      chainIdOriginal: MAINNET_CHAIN_IDS.arbitrum,
    },
    USDT: {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      totalSupply: '0',
      isLockActive: true,
      tokenOriginal: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      chainIdOriginal: MAINNET_CHAIN_IDS.ethereum,
    },
    BTC: {
      name: 'Bitlayer Bitcoin',
      symbol: 'BTC',
      decimals: 18,
      totalSupply: '0',
      isLockActive: true,
      tokenOriginal: DEFAULT_NATIVE_TOKEN_CONTRACT,
      chainIdOriginal: MAINNET_CHAIN_IDS.bitlayer,
    },
  },
  8453: {
    RWA: {
      name: 'Xend Real world Asset',
      symbol: 'RWA',
      decimals: 18,
      totalSupply: '0',
      isLockActive: true,
      tokenOriginal: '',
      chainIdOriginal: MAINNET_CHAIN_IDS.arbitrum,
    }
  }
}

export const MULTISIG_ADDRESSES = {
  [MAINNET_CHAIN_IDS.arbitrum]: '',
  [MAINNET_CHAIN_IDS.assetChain]: '',
  [MAINNET_CHAIN_IDS.base]: '',
  [MAINNET_CHAIN_IDS.bitlayer]: '',
  [MAINNET_CHAIN_IDS.bsc]: '',
  [MAINNET_CHAIN_IDS.ethereum]: ''
}