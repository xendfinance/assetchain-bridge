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
      gasPrice: 0,

      // tags: ['fork'],
      // deploy: ['deploy/fork/'],
      // forking: {
      //   url: 'https://rpc.ankr.com/bsc',
      // },
    },
    xend_testnet: {
      tags: ['testnet'],
      deploy: ['deploy/testnet/'],
      url: 'https://enugu-rpc.assetchain.org',
      accounts: [process.env.PRIVATE_TEST!]
    },
    arbitrum_sepolia: {
      tags: ['testnet'],
      deploy: ['deploy/testnet/'],
      url: 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
      accounts: [process.env.PRIVATE_TEST!],
    },
    bsc_testnet: {
      tags: ['testnet'],
      deploy: ['deploy/testnet/'],
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      accounts: [process.env.PRIVATE_TEST!],
    },
    base_sepolia: {
      url: 'https://base-sepolia-rpc.publicnode.com',
      tags: ['testnet'],
      deploy: ['deploy/testnet/'],
      accounts: [process.env.PRIVATE_TEST!],
    },
    // polygon_amoy: {
    //   tags: ['testnet'],
    //   deploy: ['deploy/testnet/'],
    //   url: 'https://polygon-amoy.blockpi.network/v1/rpc/public',
    //   accounts: [process.env.PRIVATE_TEST!],
    // },
    // eth_sepolia: {
    //   tags: ['testnet'],
    //   deploy: ['deploy/testnet/'],
    //   url: 'https://1rpc.io/sepolia',
    //   accounts: [process.env.PRIVATE_TEST!],
    // },
    // base_sepolia: {
    //   tags: ['testnet'],
    //   deploy: ['deploy/testnet/'],
    //   url: 'https://base-sepolia.blockpi.network/v1/rpc/public',
    //   accounts: [process.env.PRIVATE_TEST!],
    // },
    // ...genNetworks(),
    // place here any network you like (for overriding `genNetworks`)
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
