// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {BridgeAssistGenericUpgradeable} from './base/BridgeAssistGenericUpgradeable.sol';
import {ICircleToken} from '../interfaces/ICircleToken.sol';

/// @title BridgeAssistMintUpgradeable
/// @author gotbit
/// @dev Contract for sending tokens between chains assisted by a relayer,
/// supporting fee on send/fulfill, supporting multiple chains including
/// non-EVM blockchains, with a configurable limit per send and exchange rate
/// between chains.
contract BridgeAssistCircleMintUpgradeable is BridgeAssistGenericUpgradeable {
    constructor() BridgeAssistGenericUpgradeable() {}

    /**
     * @notice Initializing new BridgeAssistMint
     * @dev Called once by a newly created proxy contract
     * @param token_ Supported token to send
     * @param limitPerSend_ Limit per one send
     * @param feeWallet_ Platform fee wallet
     * @param feeSend_ Fee numerator (send)
     * @param feeFulfill_ Fee numerator (fulfill)
     * @param owner Bridge DEFAULT_ADMIN_ROLE holder
     * @param relayers_ Backend signers
     * @param relayerConsensusThreshold_ Number of signers required
     * to complete a transaction
     */
    function initialize(
        address token_,
        uint256 limitPerSend_,
        address feeWallet_,
        uint256 feeSend_,
        uint256 feeFulfill_,
        address owner,
        address[] memory relayers_,
        uint256 relayerConsensusThreshold_
    ) external initializer {
        _initialize(
            token_,
            limitPerSend_,
            feeWallet_,
            feeSend_,
            feeFulfill_,
            owner,
            relayers_,
            relayerConsensusThreshold_
        );
    }

    function _afterSend(
        address token,
        address user,
        uint256 amount,
        uint256 fee
    ) internal override {
        ICircleToken token_ = ICircleToken(token);
        bool success = token_.transferFrom(user, address(this), amount);
        require(success, "Bridge Assist: Transfer Failed");
        token_.burn(amount);
        if (fee != 0) {
            token_.mint(feeWallet, fee);
        }
    }

    function _afterFulfill(
        address user,
        uint256 amount,
        uint256 fee
    ) internal override {
        address token = TOKEN;
        ICircleToken(token).mint(user, amount - fee);
        if (fee != 0) {
            ICircleToken(token).mint(feeWallet, fee);
        }
    }
}
