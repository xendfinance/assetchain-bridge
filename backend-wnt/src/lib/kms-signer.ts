import { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import { Deferrable, defineReadOnly } from "@ethersproject/properties";
import { Bytes } from "@ethersproject/bytes";

import { Logger } from "@ethersproject/logger";
import { TypedDataDomain, TypedDataField } from "ethers";
import axios from "axios";

// import { version } from "../../package.json";
const logger = new Logger('0.0.0');

export class GotbitKmsSigner extends Signer implements TypedDataSigner {
  private readonly url: string;
  private readonly key: string;

  constructor(url: string, key: string, provider?: Provider) {
    super();
    this.url = url;
    this.key = key;
    defineReadOnly(this, "provider", provider);
  }

  async getAddress(): Promise<string> {
    const response = await axios.post(this.url + '/get-address', {
      key: this.key,
    })
    return response.data.address;
  }

  _fail(message: string, operation: string): Promise<any> {
    return Promise.resolve().then(() => {
      logger.throwError(message, Logger.errors.UNSUPPORTED_OPERATION, { operation: operation });
    });
  }

  signMessage(message: Bytes | string): Promise<string> {
    return this._fail("GotbitKmsSigner cannot sign messages yet", "signMessage");
  }

  signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
    return this._fail("GotbitKmsSigner cannot sign transactions yet", "signTransaction");
  }

  async _signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
    const response = await axios.post(this.url + '/sign-712', {
      key: this.key,
      domain,
      types,
      value,
    })

    return response.data.signature;
  }

  connect(provider: Provider): GotbitKmsSigner {
    return new GotbitKmsSigner(this.url, this.key, provider);
  }
}
