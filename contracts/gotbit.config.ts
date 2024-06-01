import { defineConfig, parsePrivates } from '@/gotbit-tools/hardhat/config'
import { universalRpc } from '@/gotbit-tools/hardhat/rpc'

export const config = defineConfig({
  rpc: universalRpc(),
  PRIVATE: {
    TEST: parsePrivates(process.env.PRIVATE_TEST),
    MAIN: parsePrivates(process.env.PRIVATE_MAIN),
    remote: {},
  },
  API: {
    ETH: process.env.API_ETH,
    BSC: process.env.API_BSC,
    POLYGON: process.env.API_POLYGON,
    AVAX: process.env.API_AVAX,
    FTM: process.env.API_FTM,
    ARBITRUM: process.env.API_ARBITRUM,
  },
})
