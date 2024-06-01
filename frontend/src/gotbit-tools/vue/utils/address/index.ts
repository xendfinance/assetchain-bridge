import { utils } from 'ethers'

export const address = (address: TemplateStringsArray) => {
  return new Address(address[0])
}

export class Address {
  constructor(public readonly address: string) {
    if (!utils.isAddress(address)) throw Error(`Invalid address: ${address}`)
  }

  toString(): string {
    return this.address
  }

  eq(another: Address) {
    return this.checksum === another.checksum
  }

  get short(): string {
    return this.address.shortAddress()
  }

  get checksum(): string {
    return utils.getAddress(this.address)
  }

  static isAddress(address: string) {
    return utils.isAddress(address)
  }
}
