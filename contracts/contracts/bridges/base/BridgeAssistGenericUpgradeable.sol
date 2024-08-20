// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import {IBridgeAssist} from '../../interfaces/IBridgeAssist.sol';

import {AccessControlUpgradeable} from '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import {PausableUpgradeable} from '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import {EIP712Upgradeable} from '@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol';

import {ECDSAUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol';
import {SafeERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import {StringsUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol';
import {EnumerableSetUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol';

/// @title BridgeAssistGenericUpgradeable
/// @author gotbit
/// @dev Basic contract for sending tokens between chains assisted by a relayer,
/// supporting fee on send/fulfill, supporting multiple chains including
/// non-EVM blockchains, with a configurable limit per send and exchange rate
/// between chains.
abstract contract BridgeAssistGenericUpgradeable is
    AccessControlUpgradeable,
    PausableUpgradeable,
    EIP712Upgradeable,
    IBridgeAssist
{
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.Bytes32Set;

    struct Transaction {
        uint256 amount;
        uint256 timestamp;
        address fromUser;
        string toUser; // can be a solana address
        string fromChain;
        string toChain;
        uint256 nonce;
        uint256 block;
    }

    struct FulfillTx {
        uint256 amount;
        string fromUser; // can be a solana address
        address toUser;
        string fromChain;
        uint256 nonce;
    }

    bytes32 public constant FULFILL_TX_TYPEHASH =
        keccak256(
            'FulfillTx(uint256 amount,string fromUser,address toUser,string fromChain,uint256 nonce)'
        );
    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MAX_RELAYERS = 100;
    bytes32 public immutable CURRENT_CHAIN_B32;

    address public TOKEN; // CAPS for compatibility with other bridges
    address public feeWallet;
    uint256 public limitPerSend; // maximum amount of tokens that can be sent in 1 tx
    uint256 public feeSend;
    uint256 public feeFulfill;
    uint256 public relayerConsensusThreshold;
    uint256 public nonce;

    mapping(address => Transaction[]) public transactions;
    mapping(string => mapping(string => mapping(uint256 => uint256)))
        public fulfilledAt;
    mapping(bytes32 => uint256) public exchangeRateFrom;

    EnumerableSetUpgradeable.Bytes32Set private availableChainsToSend;
    address[] public relayers;

    event SentTokens(
        address fromUser,
        string indexed toUser,
        string fromChain,
        string toChain,
        uint256 amount,
        uint256 exchangeRate
    );

    event FulfilledTokens(
        string indexed fromUser,
        address indexed toUser,
        string fromChain,
        string toChain,
        uint256 amount,
        uint256 exchangeRate
    );

    event ChainAdded(string indexed chain, uint256 exchangeRate);
    event ChainRemoved(string indexed chain);

    event RelayerSet(address indexed relayer);
    event RelayerConsensusThresholdSet(uint256 indexed value);

    event FeeSet(uint256 feeSend, uint256 feeFulfill);
    event FeeWalletSet(address indexed feeWallet);

    event LimitPerSendSet(uint256 limitPerSend);

    constructor() {
        CURRENT_CHAIN_B32 = bytes32(
            bytes.concat(
                'evm.',
                bytes(StringsUpgradeable.toString(uint256(block.chainid)))
            )
        );

        _disableInitializers();
    }

    /**
     * @notice Initializing new BridgeAssist proxy
     * @dev Called once by a newly created proxy contract
     * @param token_ Supported token to send
     * @param feeWallet_ Platform fee wallet
     * @param feeFulfill_ Fee numerator (fulfill)
     * @param owner Bridge DEFAULT_ADMIN_ROLE holder
     * @param relayers_ Backend signers
     * @param relayerConsensusThreshold_ Number of signers required
     * to complete a transaction
     */
    function _initialize(
        address token_,
        uint256 limitPerSend_,
        address feeWallet_,
        uint256 feeSend_,
        uint256 feeFulfill_,
        address owner,
        address[] memory relayers_,
        uint256 relayerConsensusThreshold_
    ) internal {
        require(token_ != address(0), 'Token is zero address');
        require(feeWallet_ != address(0), 'Fee wallet is zero address');
        require(feeSend_ < FEE_DENOMINATOR, 'Fee send is too high');
        require(feeFulfill_ < FEE_DENOMINATOR, 'Fee fulfill is too high');
        require(owner != address(0), 'Owner is zero address');
        require(relayers_.length != 0, 'No relayers');
        require(relayers_.length <= MAX_RELAYERS, 'Too many relayers');
        require(relayerConsensusThreshold_ != 0, '0-of-N');
        require(relayerConsensusThreshold_ <= relayers_.length, 'N-of-N');

        for (uint256 i; i < relayers_.length; ) {
            for (uint256 j; j < relayers_.length; ) {
                require(
                    i == j || relayers_[i] != relayers_[j],
                    'Duplicate relayers'
                );
                unchecked {
                    ++j;
                }
            }
            unchecked {
                ++i;
            }
        }

        __EIP712_init('BridgeAssist', '1.0');

        TOKEN = token_;
        limitPerSend = limitPerSend_;
        feeWallet = feeWallet_;
        feeSend = feeSend_;
        feeFulfill = feeFulfill_;
        relayers = relayers_;
        relayerConsensusThreshold = relayerConsensusThreshold_;

        _grantRole(DEFAULT_ADMIN_ROLE, owner);
    }

    /// @dev sends the user's tokens to another chain
    /// @param amount amount of tokens being sent
    /// @param toUser address of user on target chain
    /// @param toChain name of target chain (e.g. "evm.97", "sol.mainnet-beta")
    function send(
        uint256 amount,
        string memory toUser, // marked as memory to prevent "stack too deep"
        string calldata toChain
    ) external payable virtual whenNotPaused {
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

        _afterSend(TOKEN, msg.sender, amount, currentFee * exchangeRate);
    }

    /// @dev fulfills a bridge transaction from another chain
    /// @param transaction bridge transaction to fulfill
    /// @param signatures signatures for `transaction` signed by `relayers` where
    /// `signatures[i]` is either a signature by `relayers[i]` or an empty array
    function fulfill(
        FulfillTx calldata transaction,
        bytes[] calldata signatures
    ) external virtual whenNotPaused {
        require(
            isSupportedChain(transaction.fromChain),
            'Not supported fromChain'
        );
        require(
            fulfilledAt[transaction.fromChain][transaction.fromUser][
                transaction.nonce
            ] == 0,
            'Signature already fulfilled'
        );
        require(signatures.length == relayers.length, 'Bad signatures length');

        bytes32 hashedData = _hashTransaction(transaction);
        uint256 relayerConsensus;

        for (uint256 i = 0; i < signatures.length; ) {
            if (signatures[i].length == 0) {
                unchecked {
                    ++i;
                }
                continue;
            }
            if (_verify(hashedData, signatures[i]) != relayers[i]) {
                revert(
                    string.concat(
                        'Bad signature at index',
                        StringsUpgradeable.toString(i)
                    )
                );
            }
            unchecked {
                ++relayerConsensus;
                ++i;
            }
        }

        require(
            relayerConsensus >= relayerConsensusThreshold,
            'Not enough relayers'
        );

        fulfilledAt[transaction.fromChain][transaction.fromUser][
            transaction.nonce
        ] = block.number;

        uint256 exchangeRate = exchangeRateFrom[
            bytes32(bytes(transaction.fromChain))
        ];
        uint256 amount = transaction.amount * exchangeRate;
        uint256 currentFee = (amount * feeFulfill) / FEE_DENOMINATOR;

        emit FulfilledTokens(
            transaction.fromUser,
            transaction.toUser,
            transaction.fromChain,
            CURRENT_CHAIN(),
            // amount emitted is different than amount in the struct
            // because this is the amount that actually gets sent on this chain
            // it doesn't matter that much anyways since you can always get
            // the exchangeRate and do all the calculations yourself
            amount - currentFee,
            exchangeRate
        );

        _afterFulfill(transaction.toUser, amount, currentFee);
    }

    /// @dev add chains to the whitelist
    /// @param chains chains to add
    /// @param exchangeRatesFromPow exchange rates for `chains` as a power of 10.
    ///     exchange rate is a multiplier that fixes the difference
    ///     between decimals on different chains
    function addChains(
        string[] calldata chains,
        uint256[] calldata exchangeRatesFromPow
    ) external onlyRole(MANAGER_ROLE) {
        require(chains.length == exchangeRatesFromPow.length, 'bad input');

        for (uint256 i; i < chains.length; ) {
            require(
                availableChainsToSend.add(bytes32(bytes(chains[i]))),
                'Chain is already in the list'
            );

            bytes32 chain = bytes32(bytes(chains[i]));
            // implicitly reverts on overflow
            uint256 exchangeRate = 10 ** exchangeRatesFromPow[i];

            if (exchangeRateFrom[chain] != 0) {
                require(
                    exchangeRateFrom[chain] == exchangeRate,
                    'cannot modify the exchange rate'
                );
            } else {
                exchangeRateFrom[chain] = exchangeRate;
            }
            emit ChainAdded(chains[i], exchangeRate);

            unchecked {
                ++i;
            }
        }
    }

    /// @dev set the list of relayers and the consensus threshold used for fulfilling
    /// @param relayers_ list of relayers with NO DUPLICATES!!
    /// there is no check for that for gas efficiency reasons
    /// @param relayerConsensusThreshold_ number of relayers required to agree to fulfill a transaction
    function setRelayers(
        address[] calldata relayers_,
        uint256 relayerConsensusThreshold_
    ) external onlyRole(MANAGER_ROLE) {
        require(relayers_.length != 0, 'No relayers');
        require(relayers_.length <= MAX_RELAYERS, 'Too many relayers');
        require(relayerConsensusThreshold_ != 0, '0-of-N');
        require(relayerConsensusThreshold_ <= relayers_.length, 'N-of-N');

        for (uint256 i = 0; i < relayers_.length; ) {
            for (uint256 j = 0; j < relayers_.length; ) {
                require(
                    i == j || relayers_[i] != relayers_[j],
                    'Duplicate relayers'
                );
                unchecked {
                    ++j;
                }
            }
            emit RelayerSet(relayers_[i]);

            unchecked {
                ++i;
            }
        }

        relayers = relayers_;
        relayerConsensusThreshold = relayerConsensusThreshold_;

        emit RelayerConsensusThresholdSet(relayerConsensusThreshold_);
    }

    /// @dev remove chains from the whitelist
    /// @param chains chains to remove
    function removeChains(
        string[] calldata chains
    ) external onlyRole(MANAGER_ROLE) {
        for (uint256 i; i < chains.length; ) {
            require(
                availableChainsToSend.remove(bytes32(bytes(chains[i]))),
                'Chain is not in the list yet'
            );
            emit ChainRemoved(chains[i]);

            unchecked {
                ++i;
            }
        }
    }

    /// @dev set fees for send and fulfill
    /// @param feeSend_ fee for send as numerator over FEE_DENOMINATOR
    /// @param feeFulfill_ fee for fulfill as numerator over FEE_DENOMINATOR
    function setFee(uint256 feeSend_, uint256 feeFulfill_)
        external
        virtual
        onlyRole(MANAGER_ROLE)
    {
        require(
            feeSend != feeSend_ || feeFulfill != feeFulfill_,
            'Fee numerator repeats'
        );
        require(feeSend_ < FEE_DENOMINATOR, 'Fee is too high');
        require(feeFulfill_ < FEE_DENOMINATOR, 'Fee is too high');

        feeSend = feeSend_;
        feeFulfill = feeFulfill_;

        emit FeeSet(feeSend_, feeFulfill_);
    }

    /// @dev sets the wallet where fees are sent
    /// @param feeWallet_ fee wallet
    function setFeeWallet(address feeWallet_) external onlyRole(MANAGER_ROLE) {
        require(feeWallet != feeWallet_, 'Fee wallet repeats');
        require(feeWallet_ != address(0), 'Fee wallet is zero address');

        feeWallet = feeWallet_;
        emit FeeWalletSet(feeWallet_);
    }

    /// @dev sets the maximum amount of tokens that can be sent in one transaction
    /// @param limitPerSend_ limit value
    function setLimitPerSend(uint256 limitPerSend_) external virtual onlyRole(MANAGER_ROLE) {
        require(limitPerSend != limitPerSend_, 'Limit per send repeats');
        limitPerSend = limitPerSend_;
        emit LimitPerSendSet(limitPerSend_);
    }

    // /// @dev withdraw tokens from bridge
    // /// @param token_ token to withdraw
    // /// @param to the address the tokens will be sent
    // /// @param amount amount to withdraw
    // function withdraw(
    //     IERC20Upgradeable token_,
    //     address to,
    //     uint256 amount
    // ) external onlyRole(MANAGER_ROLE) {
    //     require(to != address(0), 'To: zero address');
    //     require(amount != 0, 'Amount: zero');
    //     SafeERC20Upgradeable.safeTransfer(token_, to, amount);
    // }

    /// @dev pausing the contract
    function pause() external whenNotPaused onlyRole(MANAGER_ROLE) {
        _pause();
    }

    /// @dev unpausing the contract
    function unpause() external whenPaused onlyRole(MANAGER_ROLE) {
        _unpause();
    }

    /// @dev getting a slice of list of user transactions
    /// @param user_ user
    /// @param offset_ start index
    /// @param limit_ length of array
    /// @return transactions_ list of user transactions
    function getUserTransactionsSlice(
        address user_,
        uint256 offset_,
        uint256 limit_
    ) external view returns (Transaction[] memory transactions_) {
        uint256 length = transactions[user_].length;
        require(length >= offset_ + limit_, 'bad offset/limit');

        transactions_ = new Transaction[](limit_);
        for (uint256 i; i < limit_; ) {
            transactions_[i] = transactions[user_][offset_ + i];
            unchecked {
                ++i;
            }
        }
    }

    /// @dev returns a list of bridge transactions sent by `user`
    ///   from the current chain
    /// @param user sender address
    /// @return list of transactions
    function getUserTransactions(address user)
        external
        view
        returns (Transaction[] memory)
    {
        return transactions[user];
    }

    /// @dev returns the amount of bridge transactions sent by `user`
    ///   from the current chain
    /// @param user user
    /// @return amount of transactions
    function getUserTransactionsAmount(address user) external view returns (uint256) {
        return transactions[user].length;
    }

    /// @dev getting a list of supported chains
    /// @return list of supported chains
    function supportedChainList() external view returns (bytes32[] memory) {
        return availableChainsToSend.values();
    }

    /// @return amount of relayers
    function relayersLength() external view returns (uint256) {
        return relayers.length;
    }

    /// @return list of relayers
    function getRelayers() external view returns (address[] memory) {
        return relayers;
    }

    /// @dev getting if chain is supported
    /// @param chain chain name
    /// @return is chain supported
    function isSupportedChain(
        string calldata chain
    ) public view returns (bool) {
        return availableChainsToSend.contains(bytes32(bytes(chain)));
    }

    /// @dev Returns the current chain name as a string.
    /// @return name of the current chain
    function CURRENT_CHAIN() public view returns (string memory) {
        return _toString(CURRENT_CHAIN_B32);
    }

    /// @dev hashes `Transaction` structure with EIP-712 standard
    /// @param transaction `Transaction` structure
    /// @return hash hashed `Transaction` structure
    function _hashTransaction(
        FulfillTx memory transaction
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        FULFILL_TX_TYPEHASH,
                        transaction.amount,
                        keccak256(abi.encodePacked(transaction.fromUser)),
                        transaction.toUser,
                        keccak256(abi.encodePacked(transaction.fromChain)),
                        transaction.nonce
                    )
                )
            );
    }

    /// @dev verify whether `signature` of `data` is valid and return the signer address
    /// @param data keccak256 hash of the signed data
    /// @param signature signature of `data`
    /// @return the signer address
    function _verify(
        bytes32 data,
        bytes calldata signature
    ) internal pure returns (address) {
        return ECDSAUpgradeable.recover(data, signature);
    }

    /// @dev converts a null-terminated 32-byte string to a variable length string
    /// @param source null-terminated 32-byte string
    /// @return result a variable length null-terminated string
    function _toString(
        bytes32 source
    ) internal pure returns (string memory result) {
        uint8 length;
        while (source[length] != 0 && length < 32) {
            length++;
        }
        assembly {
            result := mload(0x40)
            // new "memory end" including padding (the string isn't larger than 32 bytes)
            mstore(0x40, add(result, 0x40))
            // store length in memory
            mstore(result, length)
            // write actual data
            mstore(add(result, 0x20), source)
        }
    }

    function _afterSend(address token, address user, uint256 amount, uint256 fee) internal virtual;

    function _afterFulfill(address user, uint256 amount, uint256 fee) internal virtual;

    uint256[45] private __gap;
}