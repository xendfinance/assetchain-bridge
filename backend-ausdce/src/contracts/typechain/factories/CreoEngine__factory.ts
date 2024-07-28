/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Signer,
  utils,
  BigNumberish,
  Contract,
  ContractFactory,
  Overrides,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { CreoEngine, CreoEngineInterface } from "../CreoEngine";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_totalSupply",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "locked",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "bool",
        name: "status",
        type: "bool",
      },
    ],
    name: "setLocked",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040516200147338038062001473833981016040819052620000349162000474565b8383600362000044838262000597565b50600462000053828262000597565b505050620000706200006a620001da60201b60201c565b620001de565b8351600003620000b75760405162461bcd60e51b815260206004820152600d60248201526c4e616d6520697320656d70747960981b60448201526064015b60405180910390fd5b8251600003620000fc5760405162461bcd60e51b815260206004820152600f60248201526e53796d626f6c20697320656d70747960881b6044820152606401620000ae565b600082116200014e5760405162461bcd60e51b815260206004820152601460248201527f546f74616c20737570706c79206973207a65726f0000000000000000000000006044820152606401620000ae565b6001600160a01b038116620001a65760405162461bcd60e51b815260206004820152601560248201527f4f776e6572206973207a65726f206164647265737300000000000000000000006044820152606401620000ae565b620001c581620001bf84670de0b6b3a764000062000679565b62000230565b620001d081620001de565b50505050620006af565b3390565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b038216620002885760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401620000ae565b620002966000838362000301565b8060026000828254620002aa919062000699565b90915550506001600160a01b038216600081815260208181526040808320805486019055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050565b6001600160a01b03831660009081526006602052604090205460ff161580156200034457506001600160a01b03821660009081526006602052604090205460ff16155b620003925760405162461bcd60e51b815260206004820152601760248201527f5472616e73666572206973206e6f7420616c6c6f7765640000000000000000006044820152606401620000ae565b620003aa838383620003aa60201b620005df1760201c565b505050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112620003d757600080fd5b81516001600160401b0380821115620003f457620003f4620003af565b604051601f8301601f19908116603f011681019082821181831017156200041f576200041f620003af565b816040528381526020925086838588010111156200043c57600080fd5b600091505b8382101562000460578582018301518183018401529082019062000441565b600093810190920192909252949350505050565b600080600080608085870312156200048b57600080fd5b84516001600160401b0380821115620004a357600080fd5b620004b188838901620003c5565b95506020870151915080821115620004c857600080fd5b50620004d787828801620003c5565b60408701516060880151919550935090506001600160a01b0381168114620004fe57600080fd5b939692955090935050565b600181811c908216806200051e57607f821691505b6020821081036200053f57634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620003aa57600081815260208120601f850160051c810160208610156200056e5750805b601f850160051c820191505b818110156200058f578281556001016200057a565b505050505050565b81516001600160401b03811115620005b357620005b3620003af565b620005cb81620005c4845462000509565b8462000545565b602080601f831160018114620006035760008415620005ea5750858301515b600019600386901b1c1916600185901b1785556200058f565b600085815260208120601f198616915b82811015620006345788860151825594840194600190910190840162000613565b5085821015620006535787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b808202811582820484141762000693576200069362000663565b92915050565b8082018082111562000693576200069362000663565b610db480620006bf6000396000f3fe608060405234801561001057600080fd5b50600436106101165760003560e01c806379cc6790116100a2578063a457c2d711610071578063a457c2d714610232578063a9059cbb14610245578063cbf9fe5f14610258578063dd62ed3e1461027b578063f2fde38b1461028e57600080fd5b806379cc6790146101e957806389ad0a34146101fc5780638da5cb5b1461020f57806395d89b411461022a57600080fd5b8063313ce567116100e9578063313ce56714610181578063395093511461019057806342966c68146101a357806370a08231146101b8578063715018a6146101e157600080fd5b806306fdde031461011b578063095ea7b31461013957806318160ddd1461015c57806323b872dd1461016e575b600080fd5b6101236102a1565b6040516101309190610ba9565b60405180910390f35b61014c610147366004610c13565b610333565b6040519015158152602001610130565b6002545b604051908152602001610130565b61014c61017c366004610c3d565b61034d565b60405160128152602001610130565b61014c61019e366004610c13565b610371565b6101b66101b1366004610c79565b610393565b005b6101606101c6366004610c92565b6001600160a01b031660009081526020819052604090205490565b6101b66103a0565b6101b66101f7366004610c13565b6103b4565b6101b661020a366004610cb4565b6103cd565b6005546040516001600160a01b039091168152602001610130565b6101236104a6565b61014c610240366004610c13565b6104b5565b61014c610253366004610c13565b610530565b61014c610266366004610c92565b60066020526000908152604090205460ff1681565b610160610289366004610cf0565b61053e565b6101b661029c366004610c92565b610569565b6060600380546102b090610d23565b80601f01602080910402602001604051908101604052809291908181526020018280546102dc90610d23565b80156103295780601f106102fe57610100808354040283529160200191610329565b820191906000526020600020905b81548152906001019060200180831161030c57829003601f168201915b5050505050905090565b6000336103418185856105e4565b60019150505b92915050565b60003361035b858285610708565b610366858585610782565b506001949350505050565b600033610341818585610384838361053e565b61038e9190610d5d565b6105e4565b61039d3382610931565b50565b6103a8610a6f565b6103b26000610ac9565b565b6103bf823383610708565b6103c98282610931565b5050565b6103d5610a6f565b6001600160a01b03821661041f5760405162461bcd60e51b815260206004820152600c60248201526b5a65726f206164647265737360a01b60448201526064015b60405180910390fd5b6001600160a01b03821660009081526006602052604090205481151560ff90911615150361047b5760405162461bcd60e51b81526020600482015260096024820152684475706c696361746560b81b6044820152606401610416565b6001600160a01b03919091166000908152600660205260409020805460ff1916911515919091179055565b6060600480546102b090610d23565b600033816104c3828661053e565b9050838110156105235760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b6064820152608401610416565b61036682868684036105e4565b600033610341818585610782565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b610571610a6f565b6001600160a01b0381166105d65760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610416565b61039d81610ac9565b505050565b6001600160a01b0383166106465760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610416565b6001600160a01b0382166106a75760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610416565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6000610714848461053e565b9050600019811461077c578181101561076f5760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000006044820152606401610416565b61077c84848484036105e4565b50505050565b6001600160a01b0383166107e65760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610416565b6001600160a01b0382166108485760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610416565b610853838383610b1b565b6001600160a01b038316600090815260208190526040902054818110156108cb5760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608401610416565b6001600160a01b03848116600081815260208181526040808320878703905593871680835291849020805487019055925185815290927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a361077c565b6001600160a01b0382166109915760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b6064820152608401610416565b61099d82600083610b1b565b6001600160a01b03821660009081526020819052604090205481811015610a115760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b6064820152608401610416565b6001600160a01b0383166000818152602081815260408083208686039055600280548790039055518581529192917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a3505050565b6005546001600160a01b031633146103b25760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610416565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b03831660009081526006602052604090205460ff16158015610b5d57506001600160a01b03821660009081526006602052604090205460ff16155b6105df5760405162461bcd60e51b815260206004820152601760248201527f5472616e73666572206973206e6f7420616c6c6f7765640000000000000000006044820152606401610416565b600060208083528351808285015260005b81811015610bd657858101830151858201604001528201610bba565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b0381168114610c0e57600080fd5b919050565b60008060408385031215610c2657600080fd5b610c2f83610bf7565b946020939093013593505050565b600080600060608486031215610c5257600080fd5b610c5b84610bf7565b9250610c6960208501610bf7565b9150604084013590509250925092565b600060208284031215610c8b57600080fd5b5035919050565b600060208284031215610ca457600080fd5b610cad82610bf7565b9392505050565b60008060408385031215610cc757600080fd5b610cd083610bf7565b915060208301358015158114610ce557600080fd5b809150509250929050565b60008060408385031215610d0357600080fd5b610d0c83610bf7565b9150610d1a60208401610bf7565b90509250929050565b600181811c90821680610d3757607f821691505b602082108103610d5757634e487b7160e01b600052602260045260246000fd5b50919050565b8082018082111561034757634e487b7160e01b600052601160045260246000fdfea26469706673582212203aed6dd2f3becbbea4b1edb3b5ac69555e82a2d5f46937c6a37ce8007f86b01664736f6c63430008120033";

export class CreoEngine__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    _name: string,
    _symbol: string,
    _totalSupply: BigNumberish,
    _owner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<CreoEngine> {
    return super.deploy(
      _name,
      _symbol,
      _totalSupply,
      _owner,
      overrides || {}
    ) as Promise<CreoEngine>;
  }
  getDeployTransaction(
    _name: string,
    _symbol: string,
    _totalSupply: BigNumberish,
    _owner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _name,
      _symbol,
      _totalSupply,
      _owner,
      overrides || {}
    );
  }
  attach(address: string): CreoEngine {
    return super.attach(address) as CreoEngine;
  }
  connect(signer: Signer): CreoEngine__factory {
    return super.connect(signer) as CreoEngine__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CreoEngineInterface {
    return new utils.Interface(_abi) as CreoEngineInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CreoEngine {
    return new Contract(address, _abi, signerOrProvider) as CreoEngine;
  }
}