# Asset Chain Bridge frontend

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
  - [Contracts](#contracts)
- [Setup](#setup)
- [Running project](#running-project)

## Getting Started

Recommended Node version is 18.18.0.

## Project Structure

This a typescript project with `Vue 3` and `Tailwind`.

### Contracts

Smart contracts abis are found in `./src/contracts/contracts.json`.

## Setup

### Generate `.env` file
to generate .env file, run:
```bash
$ cp .env.local.example .env.local
```

Add .env file to the frontend project root.

your .env file should look the below

<!-- To add console logs, backend link and select mainnet, assign the following variables -->

```
VITE_BACKEND_LINK=https://bridge-testnet-api.assetchain.org
VITE_BACKEND_LINK_USDT=https://bridge-testnet-api-usdt.assetchain.org
VITE_BACKEND_LINK_USDC=https://bridge-testnet-api-usdc.assetchain.org
VITE_BACKEND_LINK_WNT=https://bridge-testnet-api-wnt.assetchain.org
VITE_BACKEND_LINK_WETH=https://bridge-testnet-api-weth.assetchain.org
VITE_BACKEND_LINK_WBTC=https://bridge-testnet-api-wbtc.assetchain.org
VITE_BACKEND_LINK_AUSDCE=https://bridge-testnet-api-ausdce.assetchain.org
VITE_PROD=false
VITE_DEBUG=true
```

## Running project

```bash
$ yarn # to install dependencies
$ yarn build # to run a build
$ yarn serve # to run built bundle of the frontend project
```

or

```bash
$ yarn # to install dependencies
$ yarn dev # to run frontend project
``` 
to test in dev mode


