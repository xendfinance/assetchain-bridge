/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ShortStrings, ShortStringsInterface } from "../ShortStrings";

const _abi = [
  {
    inputs: [],
    name: "InvalidShortString",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "str",
        type: "string",
      },
    ],
    name: "StringTooLong",
    type: "error",
  },
];

const _bytecode =
  "0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea264697066735822122076800efa430918e4aa63a009800076a042f1b83ae5087dc4679bebe3bdf565f764736f6c63430008120033";

export class ShortStrings__factory extends ContractFactory {
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
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ShortStrings> {
    return super.deploy(overrides || {}) as Promise<ShortStrings>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ShortStrings {
    return super.attach(address) as ShortStrings;
  }
  connect(signer: Signer): ShortStrings__factory {
    return super.connect(signer) as ShortStrings__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ShortStringsInterface {
    return new utils.Interface(_abi) as ShortStringsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ShortStrings {
    return new Contract(address, _abi, signerOrProvider) as ShortStrings;
  }
}
