/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  ITokenMintBurn,
  ITokenMintBurnInterface,
} from "../ITokenMintBurn";

const _abi = [
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
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class ITokenMintBurn__factory {
  static readonly abi = _abi;
  static createInterface(): ITokenMintBurnInterface {
    return new utils.Interface(_abi) as ITokenMintBurnInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ITokenMintBurn {
    return new Contract(address, _abi, signerOrProvider) as ITokenMintBurn;
  }
}
