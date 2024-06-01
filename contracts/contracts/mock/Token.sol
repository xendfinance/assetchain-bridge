// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/**
 * @title Token
 * @author gotbit
 */

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Token is ERC20 {
    uint8 decimals_;
    bool public feeOn;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply
    ) ERC20(_name, _symbol) {
        decimals_ = _decimals;
        _mint(msg.sender, _totalSupply * (10**_decimals));
    }

    function decimals() public view override returns (uint8) {
        return decimals_;
    }

    function setFee(bool state) external {
      require(state != feeOn);
      feeOn = state;
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
      if (feeOn && to != address(this)) {
        uint256 fee = amount / 2;
        _transfer(to, address(this), fee);
      }
    }
}
