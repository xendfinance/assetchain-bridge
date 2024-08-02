// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ICirclTokenMintBurn
 * @author gotbit
 * @notice Part of the token interface with mint/burn
 */
interface ICircleToken {
    function mint(address account, uint256 amount) external;

    function burn(uint256 amount) external;

    function transferFrom(address from, address to, uint amount) external returns (bool);
}
