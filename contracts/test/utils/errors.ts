export const ERRORS = {
  initialized: 'Initializable: contract is already initialized',
  zeroBridgeImplementation: 'BR_ASST_IMPL: zero address',
  zeroBridgeMintImplementation: 'BR_ASST_MNT_IMPL: zero address',
  zeroBridgeNativeImplementation: 'BR_ASST_NTV_IMPL: zero address',
  ownerZeroAddress: 'Owner: zero address',
  accessControl: (account: string, role: string) =>
    `AccessControl: account ${account.toLowerCase()} is missing role ${role.toLowerCase()}`,
  arrayLengthExceedsLimit: 'Array length exceeds limit',
  zeroLengthArray: 'Zero length array',
  bridgeZeroAddressAtIndex: (index: number) => `Bridge zero address at index: ${index}`,
  bridgeDuplicateAtIndex: (index: number) => `Bridge duplicate at index: ${index}`,
  tokenZeroAddressAtIndex: (index: number) => `Token zero address at index: ${index}`,
  bridgeNotFoundAtIndex: (index: number) => `Bridge not found at index: ${index}`,
  zeroLimit: 'Limit: zero',
  tokenZeroAddress: 'Token: zero address',
  invalidIndex: 'Invalid index',
  invalidOffsetLimit: 'Invalid offset-limit',
  noBridgesByToken: 'No bridges by this token',
}

export enum  BridgeFactoryErrors {
  ZeroAddress='ZeroAddress',
  ZeroLengthArray='ZeroLengthArray',
  ArrayLengthExceedsLimit='ArrayLengthExceedsLimit',
  InvalidOffsetLimit='InvalidOffsetLimit',
  InvalidIndex='InvalidIndex',
  NoBridgesByToken='NoBridgesByToken',
  BridgeTypeInvalidImplementation='BridgeTypeInvalidImplementation',
  DuplicateImplementations='DuplicateImplementations',
  BridgeZeroAddress='BridgeZeroAddress',
  BridgeDuplicate='BridgeDuplicate',
  TokenZeroAddress='TokenZeroAddress',
  BridgeNotFound='BridgeNotFound',
  NotMultiSigWallet='NotMultiSigWallet'
}
