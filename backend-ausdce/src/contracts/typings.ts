import type { BridgeAssist, Token } from './typechain'
export type TypedInterface = 'BridgeAssist' | 'Token'
export type ContractInterface<Name> =
  Name extends 'BridgeAssist'
  ? BridgeAssist :
  Name extends 'Token'
  ? Token :
  never