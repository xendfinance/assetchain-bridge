// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import {BridgeAssistNativeUpgradeable} from '../bridges/BridgeAssistNativeUpgradeable.sol';

contract MockNativeBridge is BridgeAssistNativeUpgradeable {
    function afterSend(
        address a,
        address b,
        uint256 c,
        uint256 d
    ) external pure {
        _afterSend(a, b, c, d);
    }
}
