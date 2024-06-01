import { BigNumber } from 'ethers'
import { BigNumber as BigNumber2 } from '@ethersproject/bignumber'

declare module 'ethers' {
  interface BigNumber {
    formatString(
      decimals?: number,
      precision?: number,
      sagn?: boolean,
      delimiter?: string,
    ): string

    formatNumber(decimals?: number, precision?: number, sagn?: boolean): number
  }
}
declare module '@ethersproject/bignumber' {
  interface BigNumber {
    formatString(
      decimals?: number,
      precision?: number,
      sagn?: boolean,
      delimiter?: string,
    ): string

    formatNumber(decimals?: number, precision?: number, sagn?: boolean): number
  }
}

function formatString(
  num: string,
  decimals = 18,
  precision = decimals,
  sagn = false,
  delimiter = '.',
): string {
  if (decimals === 0) return num
  num = num.padStart(decimals + 1, '0')

  const intPart = num.slice(0, -decimals).replace(/^0+/, '')
  if (precision === 0) return intPart ? intPart : '0'
  if (!intPart && sagn) {
    const zeroAmount = Array.from(num.slice(-decimals)).findIndex(
      (value, index, obj) => obj[index + 1] != '0',
    )
    precision += zeroAmount + 1
  }
  const fracPart = num.slice(-decimals).slice(0, precision).replace(/0+$/, '')

  return (intPart ? intPart : '0') + (fracPart.length > 0 ? delimiter + fracPart : '')
}

BigNumber.prototype.formatString = function (
  decimals = 18,
  precision = decimals,
  sagn = false,
  delimiter = '.',
) {
  return formatString(this.toString(), decimals, precision, sagn, delimiter)
}

BigNumber.prototype.formatNumber = function (
  decimals = 18,
  precision = decimals,
  sagn = false,
) {
  const str = this.formatString(decimals, precision, sagn)
  return Number(str)
}

BigNumber2.prototype.formatString = function (
  decimals = 18,
  precision = decimals,
  sagn = false,
  delimiter = '.',
) {
  return formatString(this.toString(), decimals, precision, sagn, delimiter)
}

BigNumber2.prototype.formatNumber = function (
  decimals = 18,
  precision = decimals,
  sagn = false,
) {
  const str = this.formatString(decimals, precision, sagn)
  return Number(str)
}
