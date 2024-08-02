// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library BridgeFactoryErrors {
    error ZeroAddress();
    error ZeroLengthArray();
    error ArrayLengthExceedsLimit();
    error InvalidOffsetLimit();
    error InvalidIndex();
    error NoBridgesByToken();
    error BridgeTypeInvalidImplementation();
    error DuplicateImplementations();
    error BridgeZeroAddress(uint256 index);
    error BridgeDuplicate(uint256 index);
    error TokenZeroAddress(uint256 index);
    error BridgeNotFound(uint256 index);
    error NotMultiSigWallet();
}
