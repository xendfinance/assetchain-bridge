# Asset Chain Bridge

This is Multichain token bridge that facilitates token transfers between different blockchain networks (including non evm chains)

## Table of Contents

- [Contract Overview](#contract-overview)
- [Environmental Setup](#environmental-setup)
- [Contributing](https://github.com/xendfinance/assetchain-bridge#contributing)
- [License](https://github.com/xendfinance/assetchain-bridge#license)
- [Support](https://github.com/xendfinance/assetchain-bridge#support)

## Contract Overview

- **BridgeAssistGenericUpgradeable**: this employs a relayer system for transaction verification, uses OpenZeppelin’s access control and security features, and allows for fee management and configurable transaction limits. The contract includes functionality to add or remove supported chains, manage relayers and their consensus threshold, and emit events for key actions. Additionally, it features pausability for emergency stops and requires implementation of post-send and post-fulfill actions in derived contracts.

- **BridgeAssistTransferUpgradeable**: The `BridgeAssistTransferUpgradeable` contract is an implementation of the `BridgeAssistGenericUpgradeable` abstract contract. The contract includes an initialization function to set up parameters such as the token, transaction limits, fee wallet, fees for sending and fulfilling transactions, the owner, and relayers with their consensus threshold. The `_afterSend` and `_afterFulfill` functions handle the token transfers and fee deductions. Specifically, `_afterSend` ensures tokens are transferred from the user to the contract and then the fee is sent to the fee wallet, while `_afterFulfill` transfers the fulfilled amount to the user minus the fee, which is again sent to the fee wallet. The contract uses OpenZeppelin libraries for secure token transfers and upgradeable functionality.

- **BridgeAssistMintUpgradeable**: The contract extends `BridgeAssistGenericUpgradeable` contracts and includes an initializer to set up key parameters such as the token, transaction limits, fee wallet, fees, owner, relayers, and the consensus threshold. The `_afterSend` function burns the specified amount of tokens from the sender and mints the fee to the fee wallet, while the `_afterFulfill` function mints the specified amount minus the fee to the recipient and mints the fee to the fee wallet. This ensures secure and efficient token transfers across different blockchains.

- **BridgeAssistNativeUpgradeable**: The `BridgeAssistNativeUpgradeable` contract extends the `BridgeAssistGenericUpgradeable` contract and includes an initializer to set up key parameters such as the token, transaction limits, fee wallet, fees, owner, relayers, and the consensus threshold. The `_afterSend` function is overridden to revert with "NOT SUPPORTED," indicating that sending is not supported for this contract. The `_afterFulfill` function is designed to transfer the specified amount minus the fee to the recipient and the fee to the fee wallet, ensuring secure and efficient native token transfers across different blockchains. The contract supports multiple chains, enforces transaction limits, and handles fee management, including the ability to set and adjust fees. The `send` function facilitates native token transfers while ensuring that the amount sent is divisible by the configured exchange rate and meets the minimum required to cover fees.

- **BridgeAssistCircleMintUpgradeable**: The `BridgeAssistCircleMintUpgradeable` contract extends the `BridgeAssistGenericUpgradeable` contract and facilitates token transfers between chains with the help of a relayer. The contract includes an initializer to configure key parameters such as the supported token, transaction limits, fee wallet, send and fulfill fees, owner, relayers, and the consensus threshold. The `_afterSend` function transfers the specified amount of tokens from the sender to the contract, burns the tokens, and mints the fee to the fee wallet. The `_afterFulfill` function mints the specified amount minus the fee to the recipient and mints the fee to the fee wallet, ensuring secure and efficient token transfers across different blockchains, including non-EVM chains.

- **BridgeFactoryUpgradeable**: The `BridgeFactoryUpgradeable` contract is designed to create and manage instances of BridgeAssist contracts for cross-chain token transfers. It uses OpenZeppelin's `ClonesUpgradeable` library to deploy new instances efficiently. The contract supports three types of bridges: `TRANSFER`, `MINT`, and `NATIVE`. Key functionalities include initializing with specific bridge implementations, creating new bridges, adding and removing third-party bridges, and changing bridge implementations. It employs roles for access control, with specific roles for creators and administrators. The contract also provides functions to query created bridges and their associated tokens, ensuring a comprehensive management system for bridge contracts within a blockchain ecosystem.

- **BridgedAssetChainToken**: The `BridgedAssetChainToken` contract is an `ERC20` token implementation designed for use as a bridged asset from another blockchain. The contract includes minting and burning functionalities, along with an optional blacklist feature to restrict transfers for specific addresses. It uses OpenZeppelin's `AccessControl` for role-based access management, defining roles such as `MINTER_ROLE`, `BURNER_ROLE`, and BLACKLISTER_ROLE. The contract is initialized with parameters including the token name, symbol, decimals, total supply, owner, whether the lock stage is active, the original token address, and the original chain ID. The mint and burn functions can only be called by accounts with the respective roles, and the blacklist functionality can be permanently disabled by an administrator. The decimals and name functions override the `ERC20` standard to return custom values, and _beforeTokenTransfer ensures transfers are blocked if either the sender or receiver is blacklisted

## Environmental Setup
1. contract

```bash
cd contracts
# Follow the instructions in the README.md file for setting up the harhat environment
```

2. frontend

```bash
cd frontend
# Follow the instructions in the README.md file for setting up the frontend
```

3. backend
for each of the token backend (e.g backend_usdt). navigate to the folder and Follow the instructions in the README.md file to set up it environment

## Contributing

See [CONTRIBUTING.md](https://github.com/xendfinance/assetchain-bridge/CONTRIBUTING.md) for contribution and pull request protocol. We expect contributors to follow our guide when submitting code or comments.

## License

[![License: GPL v3.0](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

## Support

For questions or suggestions, just say Hi on [Telegram](https://t.me/xendfinancedevs).<br/>
We're always glad to help.
