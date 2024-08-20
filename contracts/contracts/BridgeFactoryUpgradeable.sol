// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IBridgeAssist} from './interfaces/IBridgeAssist.sol';
import {AccessControlUpgradeable} from '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

import {ClonesUpgradeable} from '@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol';
import {EnumerableSetUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol';
import {StringsUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol';
import {BridgeFactoryErrors} from './utils/errors/BridgeFactoryErrors.sol';

/**
 * @title BridgeFactory
 * @author gotbit
 * @notice Contract for creating BridgeAssist contracts
 * @dev Creates BridgeAssists using the openzeppelin/Clones library
 */
contract BridgeFactoryUpgradeable is AccessControlUpgradeable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    enum BridgeType {
        TRANSFER,
        MINT,
        NATIVE,
        CIRCLEMINTBURN
    }

    struct BridgeAssistInfo {
        address bridgeAssist;
        address token;
    }

    bytes32 public constant CREATOR_ROLE = keccak256('CREATOR_ROLE');
    uint256 public constant ADD_REMOVE_LIMIT_PER_TIME = 100;
    address public MULTISIG_WALLET;

    mapping(BridgeType => address) public bridgeAssistImplementation;

    EnumerableSetUpgradeable.AddressSet private _createdBridges;
    mapping(address => EnumerableSetUpgradeable.AddressSet) private _bridgesByToken;

    event BridgeAssistCreated(address indexed bridgeAssist, address indexed token);
    event BridgeAssistAdded(address indexed bridgeAssist, address indexed token);
    event BridgeAssistRemoved(address indexed bridgeAssist, address indexed token);
    // once the indexed params surpase 3. there is compilation error. So, the indexed was removed
    event BridgeAssistImplementationsSet(
        address bridgeTransfer,
        address bridgeMint,
        address bridgeNative,
        address bridgeCircle
    );

    using BridgeFactoryErrors for *;

    modifier onlyMultisig() {
        if (msg.sender != MULTISIG_WALLET) revert BridgeFactoryErrors.NotMultiSigWallet();
        _;
    }

    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the BridgeFactory contract.
     * @param bridgeAssistTransferImplementation_ BridgeAssistTransfer implementation
     * @param bridgeAssistMintImplementation_ BridgeAssistMint implementation
     * @param bridgeAssistNativeImplementation_ BridgeAssistNative implementation
     * @param bridgeAssistCircleMintBurnImplementation_ BridgeAssistMint implementation
     * @param multisigWalletAddress_ Multisig wallet address
     * @param owner DEFAULT_ADMIN_ROLE holder
     */
    function initialize(
        address bridgeAssistTransferImplementation_,
        address bridgeAssistMintImplementation_,
        address bridgeAssistNativeImplementation_,
        address bridgeAssistCircleMintBurnImplementation_,
        address multisigWalletAddress_,
        address owner
    ) external initializer {
        // Ensure that owner and multisig wallet addresses are not zero
        if (owner == address(0)) revert BridgeFactoryErrors.ZeroAddress();
        if (multisigWalletAddress_ == address(0))
            revert BridgeFactoryErrors.ZeroAddress();

        // Ensure that all implementation addresses are not zero
        if (bridgeAssistTransferImplementation_ == address(0))
            revert BridgeFactoryErrors.ZeroAddress();
        if (bridgeAssistMintImplementation_ == address(0))
            revert BridgeFactoryErrors.ZeroAddress();
        if (bridgeAssistNativeImplementation_ == address(0))
            revert BridgeFactoryErrors.ZeroAddress();
        if (bridgeAssistCircleMintBurnImplementation_ == address(0))
            revert BridgeFactoryErrors.ZeroAddress();

        // Set the implementation addresses
        bridgeAssistImplementation[
            BridgeType.TRANSFER
        ] = bridgeAssistTransferImplementation_;
        bridgeAssistImplementation[BridgeType.MINT] = bridgeAssistMintImplementation_;
        bridgeAssistImplementation[BridgeType.NATIVE] = bridgeAssistNativeImplementation_;
        bridgeAssistImplementation[
            BridgeType.CIRCLEMINTBURN
        ] = bridgeAssistCircleMintBurnImplementation_;

        // Set the multisig wallet address
        MULTISIG_WALLET = multisigWalletAddress_;

        // Grant the admin role to the owner
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
    }

    /**
     * @notice Creates new BridgeAssist contract
     * @param bridgeType 0 - TRANSFER, 1 - MINT, 2 - NATIVE, 3 - CIRCLEMINTBURN
     * @param token Supported token to send (not used if NATIVE)
     * @param limitPerSend Limit per one send (not used if NATIVE)
     * @param feeWallet Platform fee wallet
     * @param feeSend Fee numerator (send) (not used if NATIVE)
     * @param feeFulfill Fee numerator (fulfill)
     * @param owner Bridge DEFAULT_ADMIN_ROLE holder
     * @param relayers Backend signers
     * @param relayerConsensusThreshold Number of signers required
     * to complete a transaction
     */
    function createBridgeAssist(
        BridgeType bridgeType,
        address token,
        uint256 limitPerSend,
        address feeWallet,
        uint256 feeSend,
        uint256 feeFulfill,
        address owner,
        address[] memory relayers,
        uint256 relayerConsensusThreshold
    ) external onlyMultisig returns (address bridge) {
        address implementation = bridgeAssistImplementation[bridgeType];
        if (implementation == address(0))
            revert BridgeFactoryErrors.BridgeTypeInvalidImplementation();

        bridge = ClonesUpgradeable.clone(implementation);
        IBridgeAssist(bridge).initialize(
            token,
            limitPerSend,
            feeWallet,
            feeSend,
            feeFulfill,
            owner,
            relayers,
            relayerConsensusThreshold
        );

        _createdBridges.add(bridge);
        _bridgesByToken[token].add(bridge);

        emit BridgeAssistCreated(bridge, token);
    }

    /**
     * @notice Allows to add third-party bridges to the stored list
     * @dev Third-party bridges interface must match the implementation bridge
     * @param bridges Bridge addresses to add
     */
    function addBridgeAssists(address[] memory bridges) external onlyMultisig {
        uint256 length = bridges.length;
        if (length == 0) revert BridgeFactoryErrors.ZeroLengthArray();
        if (length > ADD_REMOVE_LIMIT_PER_TIME)
            revert BridgeFactoryErrors.ArrayLengthExceedsLimit();

        for (uint256 i; i < length; ) {
            if (bridges[i] == address(0)) revert BridgeFactoryErrors.BridgeZeroAddress(i);
            if (!_createdBridges.add(bridges[i]))
                revert BridgeFactoryErrors.BridgeDuplicate(i);

            address token = IBridgeAssist(bridges[i]).TOKEN();
            if (token == address(0)) revert BridgeFactoryErrors.TokenZeroAddress(i);
            _bridgesByToken[token].add(bridges[i]);

            emit BridgeAssistAdded(bridges[i], token);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Allows to remove bridges from the stored list
     * @param bridges Bridge addresses to remove
     */
    function removeBridgeAssists(address[] memory bridges) external onlyMultisig {
        uint256 length = bridges.length;
        if (length == 0) revert BridgeFactoryErrors.ZeroLengthArray();
        if (length > ADD_REMOVE_LIMIT_PER_TIME)
            revert BridgeFactoryErrors.ArrayLengthExceedsLimit();

        for (uint256 i; i < length; ) {
            if (!_createdBridges.remove(bridges[i]))
                revert BridgeFactoryErrors.BridgeNotFound(i);

            address token = IBridgeAssist(bridges[i]).TOKEN();
            _bridgesByToken[token].remove(bridges[i]);

            emit BridgeAssistRemoved(bridges[i], token);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Allows to change template for creating new bridges
     * @dev Changes the implementation address for future proxy bridges
     * @param bridgeAssistTransferImplementation_ New transfer bridge implementation address
     * @param bridgeAssistMintImplementation_ New mint bridge implementation address
     * @param bridgeAssistNativeImplementation_ New native bridge implementation address
     * @param bridgeAssistCircleMintBurnImplementation_ New CircleMintBurn bridge implementation address
     */
    function changeBridgeAssistImplementation(
        address bridgeAssistTransferImplementation_,
        address bridgeAssistMintImplementation_,
        address bridgeAssistNativeImplementation_,
        address bridgeAssistCircleMintBurnImplementation_
    ) external onlyMultisig {
        if (
            bridgeAssistTransferImplementation_ ==
            bridgeAssistImplementation[BridgeType.TRANSFER] &&
            bridgeAssistMintImplementation_ ==
            bridgeAssistImplementation[BridgeType.MINT] &&
            bridgeAssistNativeImplementation_ ==
            bridgeAssistImplementation[BridgeType.NATIVE] &&
            bridgeAssistCircleMintBurnImplementation_ ==
            bridgeAssistImplementation[BridgeType.CIRCLEMINTBURN]
        ) revert BridgeFactoryErrors.DuplicateImplementations();

        bridgeAssistImplementation[
            BridgeType.TRANSFER
        ] = bridgeAssistTransferImplementation_;
        bridgeAssistImplementation[BridgeType.MINT] = bridgeAssistMintImplementation_;
        bridgeAssistImplementation[BridgeType.NATIVE] = bridgeAssistNativeImplementation_;
        bridgeAssistImplementation[
            BridgeType.CIRCLEMINTBURN
        ] = bridgeAssistCircleMintBurnImplementation_;

        emit BridgeAssistImplementationsSet(
            bridgeAssistTransferImplementation_,
            bridgeAssistMintImplementation_,
            bridgeAssistNativeImplementation_,
            bridgeAssistCircleMintBurnImplementation_
        );
    }

    /**
     * @notice Gets created bridges info
     * @param offset Offset to start with
     * @param limit Return size limit
     *
     * Requirements:
     * {offset} + {limit} must be less than or equal to {getCreatedBridgesLength}.
     */
    function getCreatedBridgesInfo(
        uint256 offset,
        uint256 limit
    ) external view returns (BridgeAssistInfo[] memory) {
        if (limit == 0) revert BridgeFactoryErrors.ZeroLengthArray();
        if (offset + limit > _createdBridges.length())
            revert BridgeFactoryErrors.InvalidOffsetLimit();

        BridgeAssistInfo[] memory bridgesInfo = new BridgeAssistInfo[](limit);

        for (uint256 i; i < limit; ) {
            address bridge = _createdBridges.at(i + offset);
            bridgesInfo[i] = BridgeAssistInfo({
                bridgeAssist: bridge,
                token: IBridgeAssist(bridge).TOKEN()
            });

            unchecked {
                ++i;
            }
        }

        return bridgesInfo;
    }

    /**
     * @notice Gets created bridge info by index
     * @param index Bridge index to get
     *
     * Requirements:
     * {index} must be less than {getCreatedBridgesLength}.
     */
    function getCreatedBridgeInfo(
        uint256 index
    ) external view returns (BridgeAssistInfo memory) {
        if (index >= _createdBridges.length()) revert BridgeFactoryErrors.InvalidIndex();

        address bridge = _createdBridges.at(index);
        return
            BridgeAssistInfo({
                bridgeAssist: bridge,
                token: IBridgeAssist(bridge).TOKEN()
            });
    }

    /**
     * @notice Gets list of bridge addresses by token address
     * @param token Token address
     * @param offset Offset to start with
     * @param limit Return size limit
     *
     * Requirements:
     * {offset} + {limit} must be less than or equal to {getBridgesByTokenLength}.
     */
    function getBridgesByToken(
        address token,
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory) {
        if (_bridgesByToken[token].length() == 0)
            revert BridgeFactoryErrors.NoBridgesByToken();
        if (limit == 0) revert BridgeFactoryErrors.ZeroLengthArray();
        if (offset + limit > _bridgesByToken[token].length())
            revert BridgeFactoryErrors.InvalidOffsetLimit();

        address[] memory bridges = new address[](limit);

        for (uint256 i; i < limit; ) {
            bridges[i] = _bridgesByToken[token].at(i + offset);

            unchecked {
                ++i;
            }
        }

        return bridges;
    }

    /**
     * @notice Gets bridge address by token address
     * @param token Token address
     * @param index Bridge index to get
     *
     * Requirements:
     * {index} must be less than or equal to {getBridgesByTokenLength}.
     */
    function getBridgeByToken(
        address token,
        uint256 index
    ) external view returns (address) {
        if (_bridgesByToken[token].length() == 0)
            revert BridgeFactoryErrors.NoBridgesByToken();
        if (index >= _bridgesByToken[token].length())
            revert BridgeFactoryErrors.InvalidIndex();

        return _bridgesByToken[token].at(index);
    }

    /**
     * @notice Gets the number of created bridges
     */
    function getCreatedBridgesLength() external view returns (uint256) {
        return _createdBridges.length();
    }

    /**
     * @notice Gets the number of created bridges for the specified token
     * @param token Token address
     */
    function getBridgesByTokenLength(address token) external view returns (uint256) {
        return _bridgesByToken[token].length();
    }
}
