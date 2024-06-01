// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IBridgeAssist
 * @author gotbit
 * @notice Part of the BridgeAssist contract interface
 */
interface IBridgeAssist {
    function initialize(
        address token_,
        uint256 limitPerSend_,
        address feeWallet_,
        uint256 feeSend_,
        uint256 feeFulfill_,
        address owner,
        address[] memory relayers_,
        uint256 relayerConsensusThreshold_
    ) external;

    function TOKEN() external view returns (address);
}
