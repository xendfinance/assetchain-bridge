// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IERC20MintBurn
 * @author gotbit
 * @notice Part of the token interface with mint/burn
 */
interface ITokenMintBurn {
    function mint(address account, uint256 amount) external;

    function burn(address account, uint256 amount) external;
}
