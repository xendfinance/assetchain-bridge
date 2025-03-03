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
import type {
  MediaLicensingToken,
  MediaLicensingTokenInterface,
} from "../MediaLicensingToken";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "totalSupply_",
        type: "uint256",
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
        name: "user",
        type: "address",
      },
    ],
    name: "RestrictUser",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "UnrestrictUser",
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
    ],
    name: "restrictUser",
    outputs: [],
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
    name: "restrictedUsers",
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
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "unrestrictUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040516200117e3803806200117e83398101604081905262000034916200030b565b828260036200004483826200040c565b5060046200005382826200040c565b505050620000706200006a6200008560201b60201c565b62000089565b6200007c3382620000db565b50505062000500565b3390565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b038216620001375760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f20616464726573730060448201526064015b60405180910390fd5b6200014560008383620001b0565b8060026000828254620001599190620004d8565b90915550506001600160a01b038216600081815260208181526040808320805486019055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050565b6001600160a01b03831660009081526006602052604090205460ff16158015620001f357506001600160a01b03821660009081526006602052604090205460ff16155b620002415760405162461bcd60e51b815260206004820152601760248201527f5472616e73666572206973206e6f7420616c6c6f77656400000000000000000060448201526064016200012e565b505050565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200026e57600080fd5b81516001600160401b03808211156200028b576200028b62000246565b604051601f8301601f19908116603f01168101908282118183101715620002b657620002b662000246565b81604052838152602092508683858801011115620002d357600080fd5b600091505b83821015620002f75785820183015181830184015290820190620002d8565b600093810190920192909252949350505050565b6000806000606084860312156200032157600080fd5b83516001600160401b03808211156200033957600080fd5b62000347878388016200025c565b945060208601519150808211156200035e57600080fd5b506200036d868287016200025c565b925050604084015190509250925092565b600181811c908216806200039357607f821691505b602082108103620003b457634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200024157600081815260208120601f850160051c81016020861015620003e35750805b601f850160051c820191505b818110156200040457828155600101620003ef565b505050505050565b81516001600160401b0381111562000428576200042862000246565b62000440816200043984546200037e565b84620003ba565b602080601f8311600181146200047857600084156200045f5750858301515b600019600386901b1c1916600185901b17855562000404565b600085815260208120601f198616915b82811015620004a95788860151825594840194600190910190840162000488565b5085821015620004c85787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b80820180821115620004fa57634e487b7160e01b600052601160045260246000fd5b92915050565b610c6e80620005106000396000f3fe608060405234801561001057600080fd5b506004361061010b5760003560e01c806370a08231116100a257806395d89b411161007157806395d89b411461022f578063a457c2d714610237578063a9059cbb1461024a578063dd62ed3e1461025d578063f2fde38b1461027057600080fd5b806370a08231146101d0578063715018a6146101f95780638da5cb5b1461020157806391b1cfe71461021c57600080fd5b806323b872dd116100de57806323b872dd14610186578063313ce5671461019957806339509351146101a85780634333907d146101bb57600080fd5b806306fdde0314610110578063095ea7b31461012e57806318160ddd146101515780631f5c2a1214610163575b600080fd5b610118610283565b6040516101259190610ab8565b60405180910390f35b61014161013c366004610b22565b610315565b6040519015158152602001610125565b6002545b604051908152602001610125565b610141610171366004610b4c565b60066020526000908152604090205460ff1681565b610141610194366004610b6e565b61032f565b60405160128152602001610125565b6101416101b6366004610b22565b610353565b6101ce6101c9366004610b4c565b610375565b005b6101556101de366004610b4c565b6001600160a01b031660009081526020819052604090205490565b6101ce61042a565b6005546040516001600160a01b039091168152602001610125565b6101ce61022a366004610b4c565b61043e565b6101186104f0565b610141610245366004610b22565b6104ff565b610141610258366004610b22565b61057a565b61015561026b366004610baa565b610588565b6101ce61027e366004610b4c565b6105b3565b60606003805461029290610bdd565b80601f01602080910402602001604051908101604052809291908181526020018280546102be90610bdd565b801561030b5780601f106102e05761010080835404028352916020019161030b565b820191906000526020600020905b8154815290600101906020018083116102ee57829003601f168201915b5050505050905090565b60003361032381858561062c565b60019150505b92915050565b60003361033d858285610750565b6103488585856107ca565b506001949350505050565b6000336103238185856103668383610588565b6103709190610c17565b61062c565b61037d610979565b6001600160a01b03811660009081526006602052604090205460ff166103e15760405162461bcd60e51b8152602060048201526014602482015273105b1c9958591e481d5b9c995cdd1c9a58dd195960621b60448201526064015b60405180910390fd5b6001600160a01b038116600081815260066020526040808220805460ff19169055517ffc9b2e880a398db938dca6e5ab922c75358d11e219fc330cd98bf20947e281bf9190a250565b610432610979565b61043c60006109d3565b565b610446610979565b6001600160a01b03811660009081526006602052604090205460ff16156104a45760405162461bcd60e51b8152602060048201526012602482015271105b1c9958591e481c995cdd1c9a58dd195960721b60448201526064016103d8565b6001600160a01b038116600081815260066020526040808220805460ff19166001179055517f1bb9f3ab44e3cd9c1e63ecc9990520b842fcd85713b5cfb65374ba663f61469f9190a250565b60606004805461029290610bdd565b6000338161050d8286610588565b90508381101561056d5760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b60648201526084016103d8565b610348828686840361062c565b6000336103238185856107ca565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6105bb610979565b6001600160a01b0381166106205760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016103d8565b610629816109d3565b50565b6001600160a01b03831661068e5760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b60648201526084016103d8565b6001600160a01b0382166106ef5760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b60648201526084016103d8565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b600061075c8484610588565b905060001981146107c457818110156107b75760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e636500000060448201526064016103d8565b6107c4848484840361062c565b50505050565b6001600160a01b03831661082e5760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b60648201526084016103d8565b6001600160a01b0382166108905760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b60648201526084016103d8565b61089b838383610a25565b6001600160a01b038316600090815260208190526040902054818110156109135760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b60648201526084016103d8565b6001600160a01b03848116600081815260208181526040808320878703905593871680835291849020805487019055925185815290927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a36107c4565b6005546001600160a01b0316331461043c5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016103d8565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b03831660009081526006602052604090205460ff16158015610a6757506001600160a01b03821660009081526006602052604090205460ff16155b610ab35760405162461bcd60e51b815260206004820152601760248201527f5472616e73666572206973206e6f7420616c6c6f77656400000000000000000060448201526064016103d8565b505050565b600060208083528351808285015260005b81811015610ae557858101830151858201604001528201610ac9565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b0381168114610b1d57600080fd5b919050565b60008060408385031215610b3557600080fd5b610b3e83610b06565b946020939093013593505050565b600060208284031215610b5e57600080fd5b610b6782610b06565b9392505050565b600080600060608486031215610b8357600080fd5b610b8c84610b06565b9250610b9a60208501610b06565b9150604084013590509250925092565b60008060408385031215610bbd57600080fd5b610bc683610b06565b9150610bd460208401610b06565b90509250929050565b600181811c90821680610bf157607f821691505b602082108103610c1157634e487b7160e01b600052602260045260246000fd5b50919050565b8082018082111561032957634e487b7160e01b600052601160045260246000fdfea2646970667358221220b1301943ee491a19dbd86f322870c1eaf70dfef556d9a04400d32f04b2ec314864736f6c63430008120033";

export class MediaLicensingToken__factory extends ContractFactory {
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
    name: string,
    symbol: string,
    totalSupply_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MediaLicensingToken> {
    return super.deploy(
      name,
      symbol,
      totalSupply_,
      overrides || {}
    ) as Promise<MediaLicensingToken>;
  }
  getDeployTransaction(
    name: string,
    symbol: string,
    totalSupply_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      name,
      symbol,
      totalSupply_,
      overrides || {}
    );
  }
  attach(address: string): MediaLicensingToken {
    return super.attach(address) as MediaLicensingToken;
  }
  connect(signer: Signer): MediaLicensingToken__factory {
    return super.connect(signer) as MediaLicensingToken__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MediaLicensingTokenInterface {
    return new utils.Interface(_abi) as MediaLicensingTokenInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MediaLicensingToken {
    return new Contract(address, _abi, signerOrProvider) as MediaLicensingToken;
  }
}
