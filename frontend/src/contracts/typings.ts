import type { BridgeAssistMintUpgradeable, BridgeAssistNativeUpgradeable, BridgeAssistTransferUpgradeable, BridgeFactoryUpgradeable } from './typechain'
export type TypedInterface = 'BridgeAssistMintUpgradeable' | 'BridgeAssistNativeUpgradeable' | 'BridgeAssistTransferUpgradeable' | 'BridgeFactoryUpgradeable'
export type ContractInterface<Name> =
  Name extends 'BridgeAssistMintUpgradeable'
  ? BridgeAssistMintUpgradeable :
  Name extends 'BridgeAssistNativeUpgradeable'
  ? BridgeAssistNativeUpgradeable :
  Name extends 'BridgeAssistTransferUpgradeable'
  ? BridgeAssistTransferUpgradeable :
  Name extends 'BridgeFactoryUpgradeable'
  ? BridgeFactoryUpgradeable :
  never