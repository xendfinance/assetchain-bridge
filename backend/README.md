# Asset Chain Bridge backend for RWA

## Description

Bridge is a decentralized application that consists of front-end, back-end, and smart contracts on every blockchain network used in the Bridge. 

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
  - [Contracts](#contracts)
  - [Confirmations blocks](#confirmations-blocks)
  - [Endpoints](#endpoints)
  - [Backend structure](#backend-structure)
  - [SecurityBackend structure](#security)
  

## Getting Started

Recommended Node version is 16.20.0.

Generate `.env` file

```bash
$ cp .env.example .env
```

Add .env file to the project root.

To add the private key of a relayer account, assign the following variable and add `PROD` variable (`true` to setup mainnet or `false` to setup testnet)

```
PRIVATE_KEY=
PROD=
```

```bash
$ yarn
$ yarn build
$ yarn serve
```

## Project Structure

This a typescript backend with `express`.

This backend does not use the database and does not listen to events

Endpoint `/transactions` receiving the user's address from the frontend at the moment of request runs through all used networks and gets the user's transactions using the `getUserTransactions()` function on the contract. After that, the backend finds pairs among them, which indicates that the transaction is labeled and the remaining transactions are not picked up on the destined networks. Having received the final list of transactions, the backend gives them to the frontend

Endpoint `/sign` receiving as input the parameters 
  `fromChain: string`,
  `fromUser: string`,
  `index: string`,
  `toBridgeAssistAddress: string`,
  `fromBridgeAddress: string`
finds the required transaction on the source network, checks that the required number of confirmation blocks has passed and if the check has passed, signs it and returns it to the user.

### Contracts

Smart contracts abis are found in `./src/contracts/contracts.json`.

### Confirmations blocks

List of amount confirmations block are found in `./src/confirmations.json`.
You can change them by replace `0` to anoter number for the corresponding chainId. 

For example if you set `"1": 15` - after send to Ethereum mainnet you need to wait `15` blocks before `claim`

### Endpoints

/transactions - get all transactions by user
params: 
user - address

/sign - get signature of selected transaction
params:
fromChain - source chain (evm.1)
fromUser - sender address
index - transaction index
toBridgeAssistAddress - Destination chain Bridge Assist Contract address
fromBridgeAddress - Source chain Bridge Assist Contract address

/health - check server health

### Backend structure

This is a backend written in typesctipt using gotbit tools template.

You have 2 environment variables that must be defined in the .env file.

All networks, contracts and rpc supported by the project are defined in the ./src/gotbit-config.ts file. 

There are 2 sets of rpc "universalRpc" and "extraRpc". 
The first set is defined in src/gotbit-tools/node/rpc.ts 
The second is defined in src/gotbit-tools/node/utils/node.ts
You can change them as you wish

All endpoints are located in the src/routes folder

There is also a file confirmations.json in which the number of confirmations blocks for each chainId is defined.
You can increase the number of confirmations blocks to prevent frontrunner attacks.
Increasing the number of blocks will allow the user to pick up the money on the receiving network only after it has passed.


You can see more details about gotbit-tools in /frontend/src/gotbit-tools/README.md

### Security

Do not show the private key used to sign transactions to anyone.
If an intruder gets this key, he can sign a fake transaction with it and withdraw all the money from your bridge.








