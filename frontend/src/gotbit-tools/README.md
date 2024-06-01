# GotBit Tools for DApp

Tool to design DApps with predefined contract architecture

## gotbit.config.ts

### Main config section

```ts
import { defineConfig } from '@/gotbit-tools/vue/config'
import { universalRpc } from '@/gotbit-tools/vue/rpc'

export const config = defineConfig({
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
  chainIds: ['97'],
  DEFAULT_CHAINID: '97',
  rpc: universalRpc(),
})
```

To define config with typings use `defineConfig` function from `@/gotbit-tools/vue/config`

- `DEBUG` - flag for controlling output from your app. If `DEBUG = true` all information about will print out in console, otherwise console will be empty. Also you can use shortcut `db;` to turn on debug information on production.
- `chainIds` - array of supporting chainIds. With `defineConfig` function will suggest all chainIds from `@/contracts/contracts.json`. If user change his chainId wallet, app will automaticaly ask for changing chain to supported chains.
- `DEFAULT_CHAINID` - default chain for all unpredicted cases. For example user is connecting first time or change chain on not supported and so on.
- `rpc` - function for converting `ChainId` ('1', '2', ...) to rpc url. Can use `universalRpc` function for this purpose or implement your own

### Contracts section

```ts
import { defineContracts } from '@/gotbit-tools/vue/config'
import type { Vesting, Token, Vesting97 } from '@/contracts/typechain'
export const contracts = defineContracts({
  vesting: addContract<Vesting>('Vesting'), // shared contract
  anyToken: addContractWithAdderss<Token>('Token'), // shared contract
  '97': {
    onlyOn97ChainContract: addContract<Vesting97, '97'>('Vesting97'), // onchain contract
  },
})
```

To define contracts with typings use `defineContracts` function from `@/gotbit-tools/vue/config`

Here you can define all contracts which will be used in DApp.
To define standart contract with predefined address use `addContract`, here you need provide interface from `typechain` for typescript suggestions and name of contracts from `@/contracts/contracts.json`.
To define contracts with unknown address but defined ABI like ERC20, you can use `addContractWithAdderss`, and in all actions with contract in future you nee provide address for interaction with blockchain

All contracts without specified chainId (`onchain contract`) can use in all chainIds if all defenition exist in `@/contracts/contracts.json`. But if your contract exists only in one chain you can define it inside chain block like `onlyOn97ChainContract` example.

### Store settings section

```ts
import { defineStoreSettings } from '@/gotbit-tools/vue/config'
export const storeSettings = defineStoreSettings(
  [
    import('@/store/contracts/token').then((_) => _.useToken),
    import('@/store/contracts/vesting').then((_) => _.useVesting),
  ],
  {
    preserveConnection: true,
    updateOnChainChange: true,
    updateOnWalletChange: true,
    globalLoading: true,
  }
)
```

To define store settings with typings use `defineStoreSettings` function from `@/gotbit-tools/vue/config`

First argument is array of contracts' stores (we will discuss what is it later, but is very important concept). Second one is options for custom DApp behavior

All contracts' stores has four lifecycles are `onInit` (when app starts), `onLogin` (when user connecting), `onFinal` (always last one in every loading phase), `onLogout` (when user disconnects wallet)

#### Options Type

```ts
type AsyncHook = () => Promise<any>
type ChangeWalletCallbackFunction = (wallet: string) => void
type ChangeChainCallbackFunction = (chainId: string) => void

export type Options = {
  changeWalletCallback?: ChangeWalletCallbackFunction
  changeChainCallback?: ChangeChainCallbackFunction
  preventDefaultChangeWallet?: boolean
  preventDefaultChangeChain?: boolean
  updateOnWalletChange?: boolean
  updateOnChainChange?: boolean
  preserveConnection?: boolean
  globalLoading?: boolean
}
```

- `changeWalletCallback` - your custom callback which will be executed in the end of change wallet event
- `changeChainCallback` - your custom callback which will be executed in the end of change chain event
- `preventDefaultChangeWallet` - if `true` prevents default behavior of wallet change (like updating info in `web3` store)
- `preventDefaultChangeChain` - if `true` prevents default behavior of chain change (like switching to supported chainIds)
- `updateOnWalletChange` - if `true` will update info in `web3` store (not work if `preventDefaultChangeWallet = true`)
- `updateOnChainChange` - if `true` will update info in `web3` store (not work if `preventDefaultChangeChain = true`)
- `preserveConnection` - if `true` will preserve connection and disconnection on page reloading
- `globalLoading` - if `true` `web3.globalLoading` will return `true` during all loading phase

## Concept of Contract Store

### Define contract's store

```ts
import { defineContractStore } from '@/gotbit-tools/vue/store'

export interface IExampleState {}
export interface IExampleActions {}

export const useExample = defineContractStore<IExampleState, IExampleActions>(
  'example', // name of store for logging purpose
  {
    state: () => ({
      loading: false, // flag of store loading or not (if store is loading = true, will not trigger any lifecycles)
    }),
    actions: {
      async onInit() {
        // init lifecycle
        return true // will triggered on app initializing
      },
      async onLogin() {
        // login lifecycle
        return true // will triggered on user wallet connection
      },
      async onFinal() {
        // final lifecycle
        return true // will triggered in the end of all loading phases
      },
      async onLogout() {
        // logout lifecycle
        return true // will triggered on user wallet disconnection
      },
    },
  }
)
```

All contracts' stores has same architecture

Every store has `loading` flag for defining if store is busy or not. Three main lifecycles entrypoints:

- `onInit()` - triggered when app init and when chainId is changed
- `onLogin()` - triggered when user connecting to app or changing wallet
- `onFinal()` - triggered in the end of all loading phase. You can use this lifecycle for clean up all info
- `onLogout()` - triggered when user disconnecting to app

  You should not define all lifecycles entrypoints, only if you need

### Convenient way to use LocalStorage and SessionStorage

```ts
import { defineContractStore } from '@/gotbit-tools/vue/store'

type Obj = { key1: number; key2: string }

export interface IExampleState {
  obj: Obj
}
export interface IExampleActions {}
export type IExampleLocalStorage = Obj

export const useExample = defineContractStore<
  IExampleState,
  IExampleActions,
  {},
  IExampleLocalStorage
>('example', {
  state: () => ({
    loading: false,
    obj: { key1: 1, key2: '1' },
  }),
  actions: {
    // ... lifecycles

    toLocalStorage() {
      return {} // error will occur
      return this.obj // auto typing with IExampleLocalStorage
    },
    fromLocalStorage(
      obj // auto typing with IExampleLocalStorage
    ) {
      this.obj = obj
    },
  },
})
```

On every update of contract's store executes `toLocalStorage` function to save your object
Starting app of triggers every contracts' stores `fromLocalStorage` function and provides correct object from `Local Storage`

Same thing with `Session Storage`

```ts
import { defineContractStore } from '@/gotbit-tools/vue/store'

type Obj = { key1: number; key2: string }

export interface IExampleState {
  obj: Obj
}
export interface IExampleActions {}
export type IExampleSessionStorage = Obj

export const useExample = defineContractStore<
  IExampleState,
  IExampleActions,
  {},
  {},
  IExampleSessionStorage
>('example', {
  state: () => ({
    loading: false,
    obj: { key1: 1, key2: '1' },
  }),
  actions: {
    // ... lifecycles

    toSessionStorage() {
      return {} // error will occur
      return this.obj // auto typing with IExampleSessionStorage
    },
    fromSessionStorage(
      obj // auto typing with IExampleSessionStorage
    ) {
      this.obj = obj
    },
  },
})
```

### Shortly about contract using in safe way

In `gotbit.config.ts` we defined contracts but how to use them?

Let's write some function inside our contract's store

```ts
import { useContracts, useWeb3 } from '@/gotbit-tools/vue'

const store = {
  // just mock
  /// ... store definition
  async tokenApprove(tokenAddress: string) {
    const web3 = useWeb3()
    const { anyToken, vesting } = useContracts(web3.signer)

    await anyToken(tokenAddress)
      .approve(vesting.address, ethers.constants.MaxUint256)
      .then((tx) => tx.wait())
  },
}
```

That's all! We can use function `useContracts` for get any contracts we defined. Also we can provide signer from `web3` store to auto connection contract to `signer`. Also you can see how to use contract with address, just provide address of contract and use it like standart contract already with connected signer or actual chain provider.

But this call can fail and will broke our frontend, to avoid this we can use `safeWrite` or `safeRead` functions, let's rewrite function

```ts
import { useContracts, useWeb3, safeWrite } from '@/gotbit-tools/vue'

/// ... store definition

const store = {
  // just mock
  /// ... store definition

  async tokenApprove(tokenAddress: string) {
    const web3 = useWeb3()
    const { anyToken, vesting } = useContracts(web3.signer!)

    const [tx, rpt] = await safeWrite(
      anyToken(tokenAddress).approve(vesting.address, ethers.constants.MaxUint256),
      () => console.log('this callback will execute if tx is failed'),
      () => console.log('this callback will execute if use confirm tx in wallet')
    )
  },
}
```

Remember `safeWrite` will automaticaly executes `await tx.wait()` just for removing repeating

Also you can read data from blockchain with `safeRead`

```ts
import { useContracts, useWeb3, safeRead } from '@/gotbit-tools/vue'

/// ... store definition

const store = {
  // just mock
  /// ... store definition

  async getBalance(tokenAddress: string) {
    const web3 = useWeb3()
    const { anyToken } = useContracts() // auto connection correct chainId

    const balance = await safeRead(
      anyToken(tokenAddress).balanceOf(web3.wallet),
      BigNumber.from(0), // default value if reading is failed
      () => console.log('this callback will execute data reading is failed')
    )
  },
}
```

If reading is failed we will get default value, also you can notice that we never provide provider for contract `useContracts` do it automaticaly
if you want specified `chainId` for loading (for example you define your contract only for specific `chainId`)

```ts
import { useContracts, useWeb3, safeRead } from '@/gotbit-tools/vue'

/// ... store definition

const store = {
  // just mock
  /// ... store definition

  async getBalance(tokenAddress: string) {
    const web3 = useWeb3()
    const { onlyOn97ChainContract } = useContracts(undefined, '97') // auto connection correct chainId

    // ... do stuff
  },
}
```

### Mutlicall

Multicall is ability to call mutliple functions on blockchain in only on rpc call

For this purpose used `ethers-mutlicall` lib, but API of this lib is pretty bad, because you need generate specific contract, you need to collect all calls and after make a call to Mutlicall Contract, after collect all data in array and work with it.... We make more convenient API.

```ts
import { defineContractStore, useMutlicall, useContracts } from '@/gotbit-tools/vue/store'

export interface IExampleState {}
export interface IExampleActions {}

export const useExample = defineContractStore<IExampleState, IExampleActions>('example', {
  state: () => ({
    loading: false,
  }),
  actions: {
    async init() {
      const mutlicall = useMutlicall()
      const { $vesting } = useContracts() // $ sign is mutlicall contract

      mutlicall.requestCall(
        $vesting.root(), // call (type string)
        (root) => console.log(root) // callback for fulfill, also typed as (string | undefined) because call can failed
      )

      return true // will triggered on app initializing
    },
    async onLogin() {
      // login lifecycle
      return true
    },
    async onFinal() {
      // cant use here mutlicall
      return true
    },
  },
})
```

And what? After all `onInits` and `onLogins` lifecycles all collected calls will fulfill and call all callbacks with value. Be careful all calls execute only after lifecycles!

Also you can do deep multicalls too. So you can define another call inside callback, and it will fulfill on second level and so on...

```ts
import { defineContractStore, useMutlicall, useContracts } from '@/gotbit-tools/vue/store'

export interface IExampleState {}
export interface IExampleActions {}

export const useExample = defineContractStore<IExampleState, IExampleActions>('example', {
  state: () => ({
    loading: false,
  }),
  actions: {
    async onInit() {
      const mutlicall = useMutlicall()
      const { $vesting, $anyToken } = useContracts() // $ sign is mutlicall contract

      mutlicall.requestCall(
        $vesting.token(), // call (type string)
        (token) => {
          if (!token) return
          mutlicall.requestCall(anyToken(token).symbol(), (symbol) => console.log(symol)) // 2nd level call
        }
      )

      return true // will triggered on app initializing
    },
    async onLogin() {
      // login lifecycle
      return true
    },
    async onFinal() {
      // cant use here mutlicall
      return true
    },
  },
})
```

Be careful all lifecycles have same mutlicall levels, it's mean you cant access data in `login` lifecycle on 1st level if you ask it on 1st level in `init` lifecycle

### Map Contracts

You can see that multicall can be bad looking if levels are increasing, and very hard to read. So lets introduce `mapContractSafe` function. You can inject in your store all contract function (only for `shared contracts`)

```ts
import { defineContractStore, mapContractSafe } from '@/gotbit-tools/vue/store'
import type { ContractActions } from '@/gotbit-tools/vue/store'

export interface IExampleState {
  tokens: Record<string, string>
}
export interface IExampleActions {
  approve: (tokenAddress: string, spender: string) => Promise<void>
}

export const useExample = defineContractStore<
  IExampleState,
  IExampleActions & ContractActions<'vesting'> & ContractActions<'anyToken'>
>('example', {
  state: () => ({
    loading: false,
    tokens: {},
  }),
  actions: {
    ...mapContractSafe('vesting'),
    ...mapContractSafe('anyToken'),
    async onInit() {
      // safeRead
      const root = await this._vesting().root().def('default value') // you can call contract with `safeRead` using def() function

      /// mutlicall
      this._vesting()
        .token()
        .fulfill((token) => {
          // 1st level
          if (!token) return
          return { call: this._anyToken(token).symbol(), arg: token }
        })
        .fulfill(
          (
            symbol, // result of call
            token // arg from prev fulfill
          ) => {
            // 2nd level
            if (!symbol) return
            this.tokens[token] = symbol
          }
        )

      this.$defer(
        -1, // provide target level for defer call (-1 - after all)
        () => {
          console.log(this.token) // will print { 'OxTOKENADDRESS': 'TOKEN_SYMOL'}, because it is after all mutlicalls
        }
      )

      return true
    },

    async approve(tokenAddress, spender) {
      const [tx, rpt] = await this._anyToken(tokenAddress).approve(
        spender,
        ethers.constants.MaxUint256
      ) // same like `safeWrite`
    },
  },
})
```

For comfortable using every function call has storng typings

## Utils functions and another stuff

### Custom `packege.json` scripts

- `yarn contracts` - copy `typechain` and `contracts.json` from root `contracts` folder to `/frontend/contracts/` directory and generates `typings.ts` for `addContract`/`addContractWithAddress` functions

### Custom Key shortcuts

- `cnt;` - Opens ContractsInfo page
- `db;` - Turn on debug mode

### Types extending

#### `String`

```ts
function toBigNumber(decimals = 18): BigNumber
function shortAddress(start = 6, end = start - 2): string
```

- `toBigNumber` - converts `tokens` to `wei` and returns `BigNumber` (using `decimals`)
- `shortAddress` - converts full address to short one version like `0xSomE...1234`

#### `BigNumber`

Now has two additional functions

```ts
function formatString(decimals = 18, precision = decimals): string
function formatNumber(decimals = 18, precision = decimals): number
```

- `formatString` - converts `weis` to `tokens` and returns `string` (using `decimals`)
- `formatNumber` - executes `formatString` and returns `Number(result)` (be careful if number bigger than max number in js, it will throw exception)

#### `console`

If you want to console out some you can add `Always` to function and it will ignore `DEBUG = false`

> _Example of usage_

```ts
console.always.log('something') // will ignore `DEBUG = false`
console.always.error('something') // will ignore `DEBUG = false`
```

### Settings

#### Autodeploy of Firebase

Template has ci/cd for auto testing and deploying apps to `firebase`

> If your app has problem with hardhat tests, it will not be deployed

1. If you push or merge request to `frontend-dev` branch app will be automaticaly deployed on `dev` firebase project using next env variables setuped in `CI/CD` gitlab
   - `FIREBASE_PROJECT_DEV` - name of firebase project for dev
   - `FIREBASE_TOKEN_DEV` - firebase token to access owner's account of `FIREBASE_PROJECT_DEV`
   - `MORALIS_ID_DEV` - moralis id for dev
2. If you push to `frontend-stable` branch app will be automaticaly deployed on `prod` firebase project usint next env vars setuped in `CI/CD` gitlab
   - `FIREBASE_PROJECT_PROD` - name of firebase project for prod
   - `FIREBASE_TOKEN_PROD` - firebase token to access owner's account of `FIREBASE_PROJECT_PROD`
   - `MORALIS_ID_PROD` - moralis id for prod

Also for `prod` version template mute all output ( turn off `DEBUG` mode )

> If app deployed on prod firebase you can toggle debug mode manually by writing in console

```ts
debugOn()
```

> If you want ot check info for another user just write in console

```ts
pretend('user address'[, 'chainId'])
```

> If want to customize firebase deploy you can do it in folder `filebase-config`

#### Types (`@/gotbit-tools/types`)

**Interface `Config`** - config for chain

- `name` - name of chain
- `rpc` - public rpc of chain
- `chainId` - chainId number
- `symbol` - symbol for native currency
- `scanner` - url of block scanner

```ts
interface Config {
  name: string
  rpc: string
  chainId: number
  symbol: string
  scanner: string
}
```

**Interface `Node`** - config for chain

- `short` - short name of chain
- `name` - name of chain
- `scanner` - url of block scanner
- `rpc` - public rpc of chain
- `chainId` - chainId number
- `type` - type of chain `testnet` or `mainnet`

```ts
interface Node {
  short: string
  name: string
  scanner: string
  rpc: string
  chainId: number
  type: 'mainnet' | 'testnet'
}
```

**Type `ChainTag`** - label of chain

```ts
type ChainTag =
  | 'localhost'
  | 'eth_mainnet'
  | 'bsc_mainnet'
  | 'polygon_mainnet'
  | 'avax_mainnet'
  | 'ftm_mainnet'
  | 'arbitrum_mainnet'
  | 'rinkeby'
  | 'ropsten'
  | 'bsc_testnet'
  | 'polygon_testnet'
  | 'avax_testnet'
  | 'ftm_testnet'
  | 'arbitrum_testnet' // example
```

#### Functions (`@/gotbit-tools`)

##### Safes

`safe` - wrapper for `async` function with error handler

- `promise` - promise of request
- `def?` - defulat value which retuns instead of `null`

```ts
async function safe<T>(
  promise: Promise<T>,
  def?: T | null
): Promise<[T, null] | [T | null, any]>
```

> _Example of usage_

```ts
async function getBalance(address: string): Promise<BigNumber> {
  const [balance, errorBalance] = await safe(contract.balanceOf(address))
  if (errorBalance) {
    console.error(errorBalance)
    return
  }
  return balance!
}
```

`safeWrite` - wrapper for `write` function on contracts (waits transaction too)

- `promise` - promise of contract interaction
- `errorCallback?` - function which executes if error occurs

```ts
async function safeWrite(
  txPromise: Promise<ContractTransaction>,
  errorCallback?: (error: any) => void,
  confirmCallback?: (error: any) => void
): Promise<{ tx: ContractTransaction | null; rpt: ContractReceipt | null }> {
```

> _Example of usage_

```ts
async function transfer(to: string, amount: BigNumber) {
  const { tx } = await safeWrite(token.transfer(to, amount))
}
```

`safeRead` - wrapper for `view` function on contracts

- `promise` - promise of contract interaction
- `defaultValue` - default value if error occurs
- `errorCallback?` - function which executes if error occurs

```ts
async function safeRead<T>(
  promise: Promise<T>,
  defaultValue: T,
  errorCallback?: (error: any) => void
): Promise<T> {
```

> _Example of usage_

```ts
async function balanceOf(user: string): Promise<BigNumber> {
  return await safeRead(token.balanceOf(user), BigNumber.from(0))
}
```

##### Chain Infomation Getters

`getChainTag` - returns `ChainTag` of chain

```ts
function getChainTag(chainId: ChainId): ChainTag
```

`getChainRpc` - returns rpc for provider

```ts
function getChainRpc(chainId: ChainId): string
```

`getChainName` - returns full name of chain

```ts
function getChainName(chainId: ChainId): string
```

`getChainHex` - returns hex of chainId

```ts
function getChainHex(chainId: ChainId): string
```

`getChainScanner` - returns scanner url of chainId

```ts
function getChainScanner(chainId: ChainId): string
```

`getChainDescription` - returns `Config` for chain

```ts
function getChainDescription(chainId: ChainId): Config
```

##### Contracts interaction

`getProvider`
`getContractsInfo`
`useContracts`
`isLogin`

#### Vars (dont use directly, use `Chain Infomation Getters`)

- `scannersLink`
- `chainIds`
- `types`
- `names`
- `symbols`
- `rpcs`
- `scanners`
- `moralisPath`
- `wallets`
- `registerWallets`
