# CREO Bridge frontend

## Getting Started

Recommended Node version is 16.20.0.

Generate `.env` file

```bash
$ cp .env.local.example .env.local
```

Add .env file to the project root.

To add console logs, backend link and select mainnet, assign the following variables

```
VITE_DEBUG=false
VITE_BACKEND_LINK="https://backend.services.milc.global"
VITE_PROD=true
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

