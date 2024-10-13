// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/**
 * @title BridgedAssetChainToken
 * @author gotbit
 * @notice Bridged token from another chain
 * @dev Includes mint, burn and optional blacklist
 */
contract BridgedAssetChainToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    bytes32 public constant BURNER_ROLE = keccak256('BURNER_ROLE');

    address public immutable TOKEN_ORIGINAL;
    uint256 public immutable CHAIN_ID_ORIGINAL;
    uint8 private immutable _DECIMALS;

    string private _name;

    bool public isLockActive;
    mapping(address => bool) public isBlacklisted;

    event BlacklistedStatusUpdated(address indexed user, bool isBlacklisted);
    event BlacklistStageDisabled();

    address public immutable MULTISIG_WALLET;

    modifier onlyMultisig() {
        require(msg.sender == MULTISIG_WALLET, 'Caller is not the multisig wallet');
        _;
    }

    /**
     * @notice Initializes token contract
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param decimals_ Token decimals
     * @param totalSupply_ Total supply (excluding decimals)
     * @param isLockActive_ Is lock stage enabled
     * @param tokenOriginal_ Initial token address on the original network
     * @param chainIdOriginal_ Original network chain id
     * @param multisigWalletAddress_ Multisig wallet address
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_,
        bool isLockActive_,
        address tokenOriginal_,
        uint256 chainIdOriginal_,
        address multisigWalletAddress_
    ) ERC20(name_, symbol_) {
        require(bytes(name_).length != 0, 'Empty name');
        require(bytes(symbol_).length != 0, 'Empty symbol');
        require(tokenOriginal_ != address(0), 'Token original: zero address');
        require(chainIdOriginal_ != 0, 'Chain id original: zero');

        _name = string.concat(name_, ' (Bridged)');
        _DECIMALS = decimals_;
        _mint(msg.sender, totalSupply_ * (10 ** decimals_));

        _grantRole(DEFAULT_ADMIN_ROLE, multisigWalletAddress_);
        isLockActive = isLockActive_;
        TOKEN_ORIGINAL = tokenOriginal_;
        CHAIN_ID_ORIGINAL = chainIdOriginal_;
        MULTISIG_WALLET = multisigWalletAddress_;
    }

    /**
     * @notice Mints tokens to user
     * @dev Can only be called by MINTER_ROLE holder.
     * The bridge must have the right to call this function.
     * @param account User address
     * @param amount Amount to mint
     */
    function mint(address account, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(account, amount);
    }

    /**
     * @notice Burns tokens from user
     * @dev Can only be called by BURNER_ROLE holder.
     * The bridge must have the right to call this function.
     * @param account User address
     * @param amount Amount to burn
     */
    function burn(address account, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(account, amount);
    }

    /**
     * @notice Updates blacklisted status for user
     * @dev Can only be called by the multisig wallet.
     * Blacklisted true can only be called if lock stage is active.
     * @param user User address
     * @param status Blacklisted status
     */
    function setBlacklisted(address user, bool status) external onlyMultisig {
        if (status) {
            require(isLockActive, 'Lock stage is not active');
        }
        require(isBlacklisted[user] != status, 'Duplicate');

        isBlacklisted[user] = status;
        emit BlacklistedStatusUpdated(user, status);
    }

    /**
     * @notice Disables lock stage forever
     * @dev Can only be called by multisig wallet.
     */
    function disableLockStage() external onlyMultisig {
        require(isLockActive, 'Lock stage is not active');

        delete isLockActive;
        emit BlacklistStageDisabled();
    }

    /**
     * @notice Returns token decimals
     */
    function decimals() public view override returns (uint8) {
        return _DECIMALS;
    }

    /**
     * @notice Returns token name
     */
    function name() public view override returns (string memory) {
        return _name;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(!isBlacklisted[from] && !isBlacklisted[to], 'Transfer is not allowed');
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @notice Overides Access Control grantRole function to only be called by MulsigWallet Address
     * @dev Can only be called by multisig wallet.
     * @param role Role Bytes
     * @param account user address
     */
    function grantRole(bytes32 role, address account) public override onlyMultisig {
        super.grantRole(role, account);
    }
}
