# Asset Chain Bridge frontend

## Getting Started

Recommended Node version is 16.20.0. Yarn version 1.22.19

Generate `.env` file

```bash
$ cp .env.local.example .env.local
```

Add .env file to the project root.

To add console logs, backend link and select mainnet, assign the following variables

```
VITE_DEBUG=true
VITE_BACKEND_LINK_USDT=https://gotbit-usdt-xend-multitoken-backend-dev.dev.gotbit.app
VITE_BACKEND_LINK_USDC=https://gotbit-usdc-xend-multitoken-backend-dev.dev.gotbit.app
VITE_BACKEND_LINK_RWA=https://gotbit-xend-multitoken-backend-dev.dev.gotbit.app
VITE_BACKEND_LINK_WETH=https://gotbit-weth-xend-multitoken-backend-dev.dev.gotbit.app
VITE_BACKEND_LINK_WNT=https://gotbit-wnt-xend-multitoken-backend-dev.dev.gotbit.app
VITE_PROD=false
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

