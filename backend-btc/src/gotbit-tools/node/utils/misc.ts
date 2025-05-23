import type contracts from '@/contracts/contracts.json'

export const realChainIds = {
  localhost: 31337,
  eth_mainnet: 1,
  bsc_mainnet: 56,
  polygon_mainnet: 137,
  avax_mainnet: 43114,
  ftm_mainnet: 250,
  arbitrum_mainnet: 42161,
  celo_mainnet: 42220,
  metis_mainnet: 1088,
  cube_mainnet: 1818,
  okex_mainnet: 66,
  cmp_mainnet: 256256,
  pulse_mainnet: 369,
  base_mainnet: 8453,
  bitlayer_mainnet: 200901,
  xend_mainnet: 42420,

  rinkeby: 4,
  ropsten: 3,
  goerli: 5,
  bsc_testnet: 97,
  polygon_testnet: 80001,
  avax_testnet: 43113,
  ftm_testnet: 4002,
  arbitrum_testnet: 421611,
  celo_alfajores_testnet: 44787,
  metis_testnet: 588,
  cube_testnet: 1819,
  okex_testnet: 65,
  cmp_testnet: 512512,
  pulse_testnet: 943,
  xend_testnet: 42421,
  arbitrum_sepolia: 421614,
  base_sepolia: 84532,
  polygon_amoy: 80002,
  eth_sepolia: 11155111,
  base_sepolia_testnet: 84532,
  bitlayer_testnet: 200810
}

export const REMOTE_DEV_PREFIX = '10000'
export const REMOTE_TEST_PREFIX = '10001'
export const REMOTE_QA_PREFIX = '10002'

export type RemoteType = 'dev' | 'qa' | 'test'

const remote = <T extends number | string>(prefix: string, id: T): T => {
  const res = (
    typeof id === 'number' ? parseInt(`${prefix}${id}`) : `${prefix}${id}`
  ) as T
  return res
}

export const toRemote = <
  T extends { [key: string]: number | string },
  Postfix extends RemoteType
>(
  input: T,
  prefix: string,
  postfix: Postfix
) => {
  type Filter<A, B> = A extends B ? A : never
  const newR = {} as {
    [key in Filter<keyof T, string> as `${key}_${Postfix}`]: T[keyof T]
  }
  for (const name in input) {
    ; (newR as any)[name + '_' + postfix] = remote(prefix, input[name])
  }
  return newR
}

export const chainIdsDev = {
  ...toRemote(realChainIds, REMOTE_DEV_PREFIX, 'dev'),
}
export const chainIdsTest = {
  ...toRemote(realChainIds, REMOTE_TEST_PREFIX, 'test'),
}
export const chainIdsQa = {
  ...toRemote(realChainIds, REMOTE_QA_PREFIX, 'qa'),
}

export const remoteChainIds = {
  ...chainIdsDev,
  ...chainIdsTest,
  ...chainIdsQa,
}

export const chainIds = {
  ...realChainIds,
  ...chainIdsDev,
  ...chainIdsTest,
  ...chainIdsQa,
}

export const chainTags: Record<number, ChainTag> = {}
for (const tag in chainIds) chainTags[chainIds[tag as ChainTag]] = tag as ChainTag

export type ChainTag = keyof typeof chainIds
export type RemoteChainTag = keyof typeof remoteChainIds
export type RealChainTag = keyof typeof realChainIds
export type LegalChains = readonly (keyof typeof contracts)[]

export type StoreLifecycle = 'init' | 'login' | 'final'

export type RpcFunction = (chainTag: ChainTag) => string

export type Default<T, D> = T extends never | never[] | null ? D : T

export type REMOTE_PREFIX =
  | typeof REMOTE_DEV_PREFIX
  | typeof REMOTE_TEST_PREFIX
  | typeof REMOTE_QA_PREFIX

type ChainIds = LegalChains[number]
type Find<F extends ChainIds> = F extends `${REMOTE_PREFIX}${infer R}`
  ? R
  : never | ChainIds

type RealChains = Find<ChainIds>

export type GotBitConfig<Chains extends RealChains[]> = {
  readonly chainIds: Default<Chains, any>
  DEFAULT_CHAINID: Default<GotBitConfig<Chains>['chainIds'][number], any>
  rpc: RpcFunction
}

export function defineConfig<Chains extends RealChains[]>(config: GotBitConfig<Chains>) {
  return config
}

const lifecycleColor: Record<StoreLifecycle, string> = {
  init: 'red',
  login: '#0a9396',
  final: 'blue',
}

export function displayStore(
  name: string,
  status: 'loading' | 'done' | 'problem' | 'busy',
  lifecycle: StoreLifecycle
) {
  if (status === 'problem') {
    console.gotbit.warn(`Problem to [${lifecycle}] store:`, name)
    return
  }
  if (status === 'busy') {
    console.gotbit.warn('Busy store:', name)
    return
  }
  console.gotbit.log(
    `${status} %c${lifecycle}%c store: %c${name}`,
    `
      color: ${lifecycleColor[lifecycle]};
      background: black;
    `,
    '',
    'color: #f77f00; font-weight: bold; background: black;'
  )
}
