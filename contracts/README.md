# Xend Multitoken Bridge

## Getting Started

Recommended Node version is 16.0.0. and higher

```bash
$ yarn
$ yarn compile
$ yarn testf
```

## Project Structure

This a hardhat typescript project with `hardhat-deploy` extension.
Solidity version `0.8.18`

### Technologies Used

Node.js 16.0.0, Yarn 1.22.19, Hardhat 2.11.0, Hardhat Deploy 0.10.6, OpenZeppelin 4.9.6

### Tests

Tests are found in the `./test/` folder.

To run tests

```bash
$ yarn testf
```

To run coverage

```bash
$ yarn coverage
```

### Contracts

Solidity smart contracts are found in `./contracts/`.
`./contracts/mock` folder contains contract mocks that are used for testing purposes.

### Deploy

Deploy scripts can be found in the `./deploy/localhost` for local testing, `./deploy/testnet` for testnet deploy and `./deploy/mainnet` for mainnet deploy

Generate `.env` file

```bash
$ cp .env.example .env
```

Add .env file to the project root.

To add the private key of a deployer account, assign the following variable

```
PRIVATE_TEST=
PRIVATE_MAIN=
```

To add API Keys for verifying (only for mainnet)

```
API_ETH=
API_BSC=
API_POLYGON=
API_AVAX=
API_FTM=
API_ARBITRUM=
```

For testnet networks, contract verification must be done manually through scanners.

**For deployment, a new wallet (without transactions on it) is required to match nonces, so that the addresses of identical contracts match on different networks.**

**Under no circumstances should you make extraneous transactions during the deployment process (for example, if the deployment fails, make some other transaction). Otherwise, the deployment may not be completed correctly and a redeploy will be necessary.**

The deployment process is structured in such a way that the addresses of identical contracts on different networks will be the same for ease of subsequent use if you follow the deployment rules described above.

***

#### Mainnet Deploy

To deploy all contracts on **mainnets**

You can validate the token parameters on Asset Chain (already filled) in the `config_mainnet.ts` file in the root directory.

After this you need to call:

```bash
yarn deploy --network arbitrum_mainnet
yarn deploy --network polygon_mainnet
yarn deploy --network eth_mainnet
yarn deploy --network bsc_mainnet
yarn deploy --network base_mainnet
yarn deploy --network xend_mainnet
```

The token parameters will be taken from the `config_mainnet.ts` file in the root folder.

The total supply for tokens on the Asset Chain should be equal to zero, since for them the bridge works according to the mint-burn principle. Otherwise (if you specify a total supply that is not equal to zero), the bridge will not work correctly.

***

#### Testnet Deploy

To deploy all contracts on **testnets**

Fill in the token parameters in the `config.ts` file, the parameters of asset-chain tokens depend on the parameters of tokens on other networks, so it is recommended to deploy to asset-chain last.

The parameters of tokens on networks, except for Asset Сhain, are located in the `DEFAULT_TOKEN_PARAMS` file constant, an example of one chain id from file:
```typescript
84532: {
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    totalSupply: '51998658367', // excluding decimals
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    totalSupply: '2937691509', // excluding decimals
  },
}
```
The parameters of tokens on Asset Сhain network, are located in the `BRIDGED_TOKEN_PARAMS` file constant, an example of one token parameters from file:
```typescript
USDT: {
  name: 'Tether USD',
  symbol: 'USDT',
  decimals: 6,
  totalSupply: '0', // should be equal to 0 due to mint/burn system on Asset Chain
  isLockActive: true, // is the blacklisting system enabled for the token
  tokenOriginal: '0x6cb8C82DaB692a708D0bbB533aa6A709d4CE6dCA', // original (non-bridged) token address
  chainIdOriginal: CHAIN_IDS.ethereum, // original (non-bridged) token chain id
},
```

After filling out the config, you need to call:

```bash
yarn deploy --network arbitrum_sepolia
yarn deploy --network polygon_amoy
yarn deploy --network eth_sepolia
yarn deploy --network bsc_testnet
yarn deploy --network base_sepolia
yarn deploy --network xend_testnet
```

The token parameters will be taken from the `config.ts` file in the root folder.

***

### Deployments

Deployments on mainnets and testnets store in `./deployments`

### Verify

To verify contracts on `Polygon chain`

```bash
$ yarn verify --network polygon_mainnet
```

The `base` network and all testnet networks do not support hardhat verification, so these networks require manual verification through a scanner.

***

### Setup
Setup is needed after bridge creating through the `BridgeFactory`.

Setup functions list (`BridgeAssist`):
1. funciton `setFee`(`feeSend_`, `feeFulfill_`)

   - `feeSend_` - amount of fee taken on sending from the contract, as fractions of 1/10000, e.g. 100 is 1%
   - `feeFulfill_` - amount of fee taken on fulfilling to the contract, as fractions of 1/10000, e.g. 100 is 1%
  
   For native bridge there is only the `feeFulfill`.

2. function `setFeeWallet`(`feeWallet_`)

   - `feeWallet_` - is new address to receive fees.

3. `setLimitPerSend`(`limitPerSend_`)

   - `limitPerSend_` - is new value of transfer limit.

4. `addChains`(`chains`, `exchangeRatesFrom`)

   - `chains` - string IDs of chains to allow interacting with from the contract
   - `exchangeRatesFrom` - array where exchangeRatesFrom[i] is the exchange rate the amount has to be multiplied by when
     fulfilled from chains[i] and divided by when sending to chains[i]

5. `setRelayers`(`relayers`, `relayerConsensusThreshold`)

   - `relayers` - an array of relayers who are trusted to relay information between chains. the array should contain no duplicates.
   - `relayerConsensusThreshold` - the amount of relayers that have to approve a transaction for it to be fulfilled

Funds for native and transfer bridges are added to the bridge addresses by transferring them to the `BridgeAssist` contract address.
**If there is not enough funds on the contract receiving funds will be impossible.**
The admins are supposed to keep enough liquidity on the both end of the bridge so that this does not happen.

For mint bridge it is needed to give the `BURNER` and `MINTER` role on the token contract to bridge. Transferring tokens to the bridge is not needed.

## Test Coverage

```text
  BridgedAssetChainToken contract
setuping "BridgeFactoryTransfer" ... setuped
    ✔ constructor requires (103ms)
    ✔ constructor (84ms)
    ✔ mint/burn (178ms)
    ✔ lock (270ms)

  BridgeFactory contract (asset chain)
    ✔ Should successfully change bridge implementation (162ms)
    Initializing
      ✔ Should execute initializer correctly (60ms)
      ✔ Initializer should revert (82ms)
      ✔ Initializer should not revert if implementation is zero address (76ms)
      ✔ Creating bridge type with zero implementation should revert (96ms)
      ✔ Re-initialize should revert (44ms)
    Creating bridges
      ✔ Should successfully create bridges (263ms)
      ✔ Creating bridges should revert due to the wrong creator (76ms)
    Adding/removing bridges
      ✔ Should successfully add new bridges (6670ms)
      ✔ Should successfully add bridges in 1 tx up to limit (6279ms)
      ✔ Adding new bridges should revert (5817ms)
      ✔ Should successfully remove bridges (6521ms)
      ✔ Should successfully remove bridges in 1 tx up to limit (7074ms)
      ✔ Removing bridges should revert (5684ms)

  BridgeAssistMint contract
    ✔ constructor requires (282ms)
    ✔ Re-initialize should revert (42ms)
    ✔ should send tokens (977ms)
    ✔ should fulfill tokens from bridgeMint preventing double-spend (824ms)
    ✔ multiple users test (1476ms)
    ✔ should take proper fee on fulfill and prevent double-spend (887ms)
    ✔ should not send over the limit (1030ms)
    ✔ should withdraw, pause, set chains, set parameters, set relayers and prevent using incorrect values (2055ms)
    ✔ the signature from bridgeDefault is invalid on other bridgeDefault (1119ms)

  BridgeAssistNative contract
    ✔ constructor requires (304ms)
    ✔ Re-initialize should revert (45ms)
    ✔ should fulfill native from bridgeDefault preventing double-spend (727ms)
    ✔ multiple users test (1251ms)
    ✔ should take proper fee on fulfill and prevent double-spend (727ms)
    ✔ should withdraw, pause, set chains, set parameters, set relayers and prevent using incorrect values (1459ms)
    ✔ the signature from bridgeNative is invalid on other bridgeNative (982ms)
    ✔ send native should fail due to invalid receiver (691ms)
    ✔ send withdraw any tokens transferred to the native bridge (503ms)
    ✔ unsupported functions should revert (355ms)

  BridgeFactory contract (non asset chain)
    ✔ Should successfully change bridgeDefault implementation (91ms)
    Initializing
      ✔ Should execute initializer correctly (45ms)
      ✔ Initializer should revert (68ms)
      ✔ Re-initialize should revert (40ms)
    Creating bridgeDefault
      ✔ Should successfully create bridgeDefault (142ms)
      ✔ Creating bridgeDefault should revert due to the wrong creator (76ms)
    Adding/removing bridges
      ✔ Should successfully add new bridges (6695ms)
      ✔ Should successfully add bridges in 1 tx up to limit (6225ms)
      ✔ Adding new bridges should revert (5784ms)
      ✔ Should successfully remove bridges (6682ms)
      ✔ Should successfully remove bridges in 1 tx up to limit (7173ms)
      ✔ Removing bridges should revert (5738ms)

  BridgeAssistTransfer contract
    ✔ constructor requires (280ms)
    ✔ Re-initialize should revert (44ms)
    ✔ should send tokens (875ms)
    ✔ should fulfill tokens from bridgeDefault preventing double-spend (794ms)
    ✔ multiple users test (1463ms)
    ✔ should take proper fee on fulfill and prevent double-spend (1001ms)
    ✔ should not send with bad token (484ms)
    ✔ should not send over the limit (917ms)
    ✔ should withdraw, pause, set chains, set parameters, set relayers and prevent using incorrect values (2076ms)
    ✔ the signature from bridgeDefault is invalid on other bridgeDefault (1063ms)


  59 passing (2m)

--------------------------------------|----------|----------|----------|----------|----------------|
| File                                   | % Stmts    | % Branch   | % Funcs    | % Lines    | Uncovered Lines  |
| -------------------------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |
| contracts/                             | 100        | 100        | 100        | 100        |                  |
| BridgeFactoryUpgradeable.sol           | 100        | 100        | 100        | 100        |                  |
| BridgedAssetChainToken.sol             | 100        | 100        | 100        | 100        |                  |
| contracts/bridges/                     | 100        | 100        | 100        | 100        |                  |
| BridgeAssistMintUpgradeable.sol        | 100        | 100        | 100        | 100        |                  |
| BridgeAssistNativeUpgradeable.sol      | 100        | 100        | 100        | 100        |                  |
| BridgeAssistTransferUpgradeable.sol    | 100        | 100        | 100        | 100        |                  |
| contracts/bridges/base/                | 100        | 100        | 100        | 100        |                  |
| BridgeAssistGenericUpgradeable.sol     | 100        | 100        | 100        | 100        |                  |
| contracts/interfaces/                  | 100        | 100        | 100        | 100        |                  |
| IBridgeAssist.sol                      | 100        | 100        | 100        | 100        |                  |
| ITokenMintBurn.sol                     | 100        | 100        | 100        | 100        |                  |
| -------------------------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |
| All files                              | 100        | 100        | 100        | 100        |                  |
| -------------------------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |
```

Contracts in contracts/mock/ will not be deployed to mainnet so they are not tested.

## Technical Requirements

The technical requirements are available [here]().

## Implementation Details

### Audit scope

The following files contain code that will be deployed on mainnet and thus require a security audit:

- `BridgeFactoryUpgradeable.sol`
- `BridgeAssistTransferUpgradeable.sol`
- `BridgeAssistMintUpgradeable.sol`
- `BridgeAssistNativeUpgradeable.sol`
- `BridgedAssetChainToken.sol`

### Architecture

The project is a factory for creating different bridge types with different supported tokens and native currency.

`CREATOR_ROLE` holder can create centralized bridge implementation for some token. End-users of the bridge trust the bridge owner with their funds.

`DEFAULT_ADMIN_ROLE` holder can add new bridges to the stored list, remove bridge assists from the stored list and change the bridge assist implementation for deploying new bridges using `BridgeFactory` contract.

The system consists of three types of bridges: `BridgeAssistTransfer`, `BridgeAssistMint` and `BridgeAssistNative` contracts deployed on different chains (implementations for proxy clones) and `BridgeFactory` which allows you to create bridges (proxies) for different tokens and native currency.
The BridgeAssist contracts have two main functions:

- `send` - receives tokens from user and stores all necessary transfer information.
- `fulfill` - allows user to get tokens he transfered on another chain.

The `BridgeAssistNative` contract doesn't have send function due to this type of bridge only works in one direction.

Send and Fulfill emit SentTokens() and FulfilledTokens() events. They contain the sender address, the recipient
address, sending chain, receiving chain, amount and exchange rate applied. **NOTE: amount is the amount that gets
transferred to/from the bridge on the current chain, which may be different from the amount the user gets on the receiving chain.**

Addresses that can potentially be non-EVM addresses are stored as strings.

#### Exchange Rate

Exchange rate is a mechanism used to account for different decimals on different chains. Let's say our Solana token has
9 decimals, but our Ethereum token has 18. We can set exchange rate on Ethereum to 10\*\*9. The amount is divided by the
exchange rate during send and multiplied during fulfill, resulting in smooth conversion.

The send function checks that the amount is wholly divisible by the exchange rate to make sure no dust is left in
the contract.

#### Limit per send

Maximum amount provided as argument to send() is limited by the limit per send, changeable by the admin. The admin
should be able to set the limit to any number from 0 to infinity. The limit can be bypassed by sending several
transactions or using multicall, which is not a problem.

### Role Model

The `BridgeFactory` roles are:
- `Creator`: can create new bridges through the factory.
- `DefaultAdmin`: can grant/revoke `Creator` role, add/remove bridges, set new `BridgeAssist` implementation.

The `BridgeAssist` roles are:

- `Relayer`: proves information from other chains. Approval from multiple `relayers` is required for a piece of information
  to be considered truthful.
- `Manager`: can set fee, feeWallet, limitPerSend, pause/unpause contract and withdraw tokens from contract.
- `DefaultAdmin`: can grant/revoke `Manager` and `DefaultAdmin` roles.

### Backend

The backend stores the wallet private key, and sign with this key transaction information (struct Transaction) from `BridgeAssist` contract on first chain, after that user can call fulfill function with this signature and receive tokens on second chain, if signature and transaction data is valid. The backend wallet address neceserily has realayer role.

### Usage Scenarios

Below are detailed step-by-step usage scenarios. They may duplicate the ones described in the technical requirement document, but they are written with much more detail, i.e. who calls what function with what parameters, and where do these parameters come from.

#### Scenario 1

1. User calls send(amount, to) ,to - is chainId, and Ethereum BridgeAssist contract transferFrom tokens and store `Transaction` structure.
2. User goes to the frontend (or directly to the backend) and request `Transaction` structure `signature` from multiple
   relayers.
3. With the signatures and `Transaction` structure user goes to the Polygon BridgeAssist contract and calls fulfill(`Transaction`, `signature`) function, user gets his corresponding tokens amount.

#### Scenario 2

1. User calls send(amount, to) ,to - is chainId, and Ethereum BridgeAssist contract transferFrom tokens and store `Transaction` structure.
2. User goes to the frontend (or directly to the backend) and request `Transaction` structure `signature` from multiple
   relayers.
3. With the signatures and `Transaction` structure user goes to the Solana BridgeAssist contract and is able to
   claim his tokens there

## Scripts:
1. factory
  this is an interactive script that can be used to carry out some functions on the bridge factory contracts. this functions includes; `createBridge`, `addbridge`, `removebridge`. You can get already deployed factory address in the frontend project. In the src/contracts/contracts.json file for each chainId supported
  to run the script;
```bash
  yarn factory:arb 
  # to run script on sepolia testnet
```

```bash
  yarn factory:bsc 
  # to run script on bsc testnet
```

```bash
  yarn factory:xend 
  # to run script on asset chain testnet
```
```bash
  yarn factory:base_sepolia 
  # to run script on Base Sepolia
```

2. bridge
  this is an interactive script that can be used to carry out some functions on the bridge assist contracts. this functions includes; `addChains`, `send`, `fulfil`

```bash
  yarn bridge:arb 
  # to run script on sepolia testnet
```

```bash
  yarn bridge:bsc 
  # to run script on bsc testnet
```

```bash
  yarn bridge:xend 
  # to run script on asset chain testnet
```

```bash
  yarn bridge:base_sepolia 
  # to run script on Base Sepolia
```
