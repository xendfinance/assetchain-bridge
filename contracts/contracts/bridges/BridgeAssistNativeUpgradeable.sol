// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {BridgeAssistGenericUpgradeable} from './base/BridgeAssistGenericUpgradeable.sol';

/// @title BridgeAssistNativeUpgradeable
/// @author gotbit
/// @dev Contract for fulfilling native tokens from chains assisted by a relayer,
/// supporting fee on fulfill, supporting multiple chains including
/// non-EVM blockchains, with a configurable exchange rate between chains.
contract BridgeAssistNativeUpgradeable is BridgeAssistGenericUpgradeable {
    address private constant _NATIVE = 0x0000000000000000000000000000000000000001;

    event FeeFulfillSet(uint256 feeFulfill);

    receive() external payable {}

    constructor() BridgeAssistGenericUpgradeable() {}

    /**
     * @notice Initializing new BridgeAssistNative
     * @dev Called once by a newly created proxy contract
     * @param token_ Supported token to send
     * @param feeWallet_ Platform fee wallet
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
        require(token_ == _NATIVE, 'Invalid token');
        // require(limitPerSend_ == 0, 'Invalid limit per send');
        // require(feeSend_ == 0, 'Invalid fee send');

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
        address,
        address,
        uint256,
        uint256
    ) internal pure override {
        revert("NOT SUPPORTED");
    }

    function _afterFulfill(
        address user,
        uint256 amount,
        uint256 fee
    ) internal override {
        if (fee != 0) {
            (bool success1, ) = feeWallet.call{value: fee}('');
            require(success1, 'Send funds error: fee wallet');
        }
        (bool success2, ) = user.call{value: amount - fee}('');
        require(success2, 'Send funds error: user');
    }

    /// @dev set fee for fulfill
    /// @param feeFulfill_ fee for fulfill as numerator over FEE_DENOMINATOR
    function setFee(uint256 feeFulfill_) external onlyRole(MANAGER_ROLE) {
        require(feeFulfill != feeFulfill_, 'Fee numerator repeats');
        require(feeFulfill_ < FEE_DENOMINATOR, 'Fee is too high');

        feeFulfill = feeFulfill_;
        emit FeeFulfillSet(feeFulfill_);
    }

    // /// @dev withdraw native tokens from bridge
    // /// @param to the address the tokens will be sent
    // /// @param amount amount to withdraw
    // function withdrawNative(address to, uint256 amount) external onlyRole(MANAGER_ROLE) {
    //     require(to != address(0), 'To: zero address');
    //     require(amount != 0, 'Amount: zero');

    //     (bool success, ) = to.call{value: amount}('');
    //     require(success, 'Unable to send funds');
    // }

    // function setFee(uint256, uint256) external pure override {
    //     revert('NOT SUPPORTED');
    // }

    // function setLimitPerSend(uint256) external pure override {
    //     revert('NOT SUPPORTED');
    // }

    function send(
        uint256 amount,
        string memory toUser,
        string calldata toChain
    ) external payable override {
        require(msg.value != 0, 'Value sent = 0');
        require(msg.value == amount, 'Value not Equal');
        require(amount != 0, 'Amount = 0');
        require(amount <= limitPerSend, 'Amount is more than limit');
        require(bytes(toUser).length != 0, 'Field toUser is empty');
        require(isSupportedChain(toChain), 'Chain is not supported');

        uint256 exchangeRate = exchangeRateFrom[bytes32(bytes(toChain))];
        require(
            amount % exchangeRate == 0,
            'Amount is not divisible by exchange rate'
        );
        // minimum amount to make sure satisfactory amount of fee is taken
        require(
            amount / exchangeRate >= FEE_DENOMINATOR,
            'amount < fee denominator'
        );

        // the fee recipient eats the precision loss
        uint256 currentFee = (amount * feeSend) /
            FEE_DENOMINATOR /
            exchangeRate;

        transactions[msg.sender].push(
            Transaction({
                fromUser: msg.sender,
                toUser: toUser,
                amount: amount / exchangeRate - currentFee,
                // No logic of the system relies on this timestamp,
                // it's only needed for displaying on the frontend
                timestamp: block.timestamp,
                fromChain: CURRENT_CHAIN(),
                toChain: toChain,
                nonce: nonce++,
                block: block.number
            })
        );

        emit SentTokens(
            msg.sender,
            toUser,
            CURRENT_CHAIN(),
            toChain,
            // amount emitted is different than amount in the struct
            // because this is the amount that actually gets sent on this chain
            // it doesn't matter that much anyways since you can always get
            // the exchangeRate and do all the calculations yourself
            (amount - currentFee),
            exchangeRate
        );
    }
}
