// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library BridgedAssetChainTokenErrors {
    error InvalidAmount(uint256 amount);
    error LockStageNotActive();
    error DuplicateStatus();
    error AlreadyBlacklisted();
    error NoBlacklistRequest();
    error BlacklistDelayNotPassed();
    error TransferNotAllowed(address from, address to);
}