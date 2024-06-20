# Asset Chain Bridge frontend

## Getting Started

Recommended Node version is 18.18.0.

Generate `.env` file

```bash
$ cp .env.local.example .env.local
```

Add .env file to the project root.

To add console logs, backend link and select mainnet, assign the following variables

```
VITE_BACKEND_LINK=https://bridge-testnet-api.assetchain.org
VITE_BACKEND_LINK_USDT=https://bridge-testnet-api-usdt.assetchain.org
VITE_BACKEND_LINK_USDC=https://bridge-testnet-api-usdc.assetchain.org
VITE_BACKEND_LINK_WNT=https://bridge-testnet-api-wnt.assetchain.org
VITE_BACKEND_LINK_WETH=https://bridge-testnet-api-weth.assetchain.org
VITE_PROD=false
VITE_DEBUG=true
```

```bash
$ yarn
$ yarn build
$ yarn serve
```

or

```bash
$ yarn
$ yarn dev
``` 
to test in dev mode
## Project Structure

This a typescript project with `Vue 3` and `Tailwind`.

### Contracts

Smart contracts abis are found in `./src/contracts/contracts.json`.

