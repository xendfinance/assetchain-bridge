import { HardhatUserConfig, task } from 'hardhat/config'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import 'module-alias/register'

import '@/gotbit-tools/hardhat/init'
import { genNetworks, genCompilers } from '@/gotbit-tools/hardhat'

task('accounts', 'Prints the list of accounts', async (_, hre) => {
  const accounts = await hre.ethers.getSigners()
  for (const account of accounts) {
    console.log(account.address)
  }
})

const config: HardhatUserConfig = {
  solidity: {
    compilers: genCompilers(['0.8.20', '0.8.18']),
  },
  networks: {
    hardhat: {
      tags: ['localhost'],
      deploy: ['deploy/localhost/'],

      initialBaseFeePerGas: 0,
      gasPrice: 0

      // tags: ['fork'],
      // deploy: ['deploy/fork/'],
      // forking: {
      //   url: 'https://rpc.ankr.com/bsc',
      // },
    },
    xend_testnet: {
      tags: ['testnet'],
      deploy: ['deploy/testnet/asset-chain'],
      url: 'https://enugu-rpc.assetchain.org',
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!]
    },
    arbitrum_sepolia: {
      tags: ['testnet'],
      deploy: ['deploy/mainnet/non-asset-chain'],
      url: 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!],
    },
    bsc_testnet: {
      tags: ['testnet'],
      deploy: ['deploy/testnet/non-asset-chain'],
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!],
    },
    base_sepolia: {
      url: 'https://base-sepolia-rpc.publicnode.com',
      tags: ['testnet'],
      deploy: ['deploy/testnet/non-asset-chain'],
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!],
    },
    bitlayer_testnet: {
      url: 'https://testnet-rpc.bitlayer.org',
      tags: ['testnet'],
      deploy: ['deploy/testnet/non-asset-chain'],
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!],
    },
    xend: {
      tags: ['mainnet'],
      deploy: ['deploy/mainnet/asset-chain'],
      url: 'https://mainnet-rpc.assetchain.org',
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!]
    },
    arbitrum: {
      tags: ['mainnet'],
      deploy: ['deploy/mainnet/non-asset-chain'],
      url: 'https://arb1.arbitrum.io/rpc',
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!],
    },
    bsc: {
      tags: ['mainnet'],
      deploy: ['deploy/mainnet/non-asset-chain'],
      url: 'https://binance.llamarpc.com',
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!],
    },
    base: {
      url: 'https://mainnet.base.org',
      tags: ['mainnet'],
      deploy: ['deploy/base'],
      // deploy: ['deploy/mainnet/non-asset-chain'],
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!],
    },
    bitlayer: {
      url: 'https://rpc.bitlayer.org',
      tags: ['mainnet'],
      // deploy: ['deploy/mainnet/non-asset-chain'],
      deploy: ['deploy/bitlayer'],
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!],
    },
    ethereum: {
      url: 'https://ethereum-rpc.publicnode.com',
      tags: ['mainnet'],
      deploy: ['deploy/mainnet/non-asset-chain'],
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!],
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      tags: ['mainnet'],
      deploy: ['deploy/mainnet/non-asset-chain'],
      accounts: [process.env.PRIVATE_TEST!, process.env.PRIVATE_TEST2!],
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
  },
  mocha: {
    timeout: 200_000,
  },
}

export default config
