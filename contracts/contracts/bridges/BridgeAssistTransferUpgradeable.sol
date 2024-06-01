// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {BridgeAssistGenericUpgradeable} from './base/BridgeAssistGenericUpgradeable.sol';
import {IERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import {SafeERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';

/// @title BridgeAssistTransferUpgradeable
/// @author gotbit
/// @dev Contract for sending tokens between chains assisted by a relayer,
/// supporting fee on send/fulfill, supporting multiple chains including
/// non-EVM blockchains, with a configurable limit per send and exchange rate
/// between chains.
contract BridgeAssistTransferUpgradeable is BridgeAssistGenericUpgradeable {
    constructor() BridgeAssistGenericUpgradeable() {}

    /**
     * @notice Initializing new BridgeAssist proxy
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
        IERC20Upgradeable token_ = IERC20Upgradeable(token);

        {
            uint256 balanceBefore = token_.balanceOf(address(this));
            SafeERC20Upgradeable.safeTransferFrom(token_, user, address(this), amount);
            uint256 balanceAfter = token_.balanceOf(address(this));
            require(balanceAfter - balanceBefore == amount, 'bad token');
        }

        if (fee != 0) {
            SafeERC20Upgradeable.safeTransfer(token_, feeWallet, fee);
        }
    }

    function _afterFulfill(
        address user,
        uint256 amount,
        uint256 fee
    ) internal override {
        IERC20Upgradeable token_ = IERC20Upgradeable(TOKEN);

        SafeERC20Upgradeable.safeTransfer(token_, user, amount - fee);
        if (fee != 0) {
            SafeERC20Upgradeable.safeTransfer(token_, feeWallet, fee);
        }
    }
}
