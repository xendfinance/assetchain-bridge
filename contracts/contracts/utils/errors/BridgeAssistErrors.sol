// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library BridgeAssistErrors {
    error ZeroAddress();
    error FeeTooHigh();
    error NoRelayers();
    error TooManyRelayers();
    error InvalidRelayerConsensus();
    error DuplicateRelayers();
    error AmountIsZero();
    error AmountExceedsLimit();
    error EmptyFieldToUser();
    error ChainNotSupported();
    error AmountNotDivisibleByExchangeRate();
    error AmountLessThanFeeDenominator();
    error SignatureAlreadyFulfilled();
    error BadSignaturesLength();
    error BadSignatureAtIndex(uint256 index);
    error NotEnoughRelayers();
    error BadInput();
    error EmptyChainName();
    error ChainAlreadyInList();
    error ZeroExchangeRate();
    error ExchangeRateCannotBeModified();
    error ChainNotInList();
    error DuplicateFee();
    error FeeWalletCannotBeZero();
    error DuplicateLimit();
    error WithdrawAmountExceedsBalance();
    error BadOffsetLimit();
}
