import { BigNumber } from 'ethers'
import { BigNumber as BigNumber2 } from '@ethersproject/bignumber'

declare module 'ethers' {
  interface BigNumber {
    formatString(decimals?: number, precision?: number): string
    formatNumber(decimals?: number, precision?: number): number
  }
}

declare module '@ethersproject/bignumber' {
  interface BigNumber {
    formatString(decimals?: number, precision?: number): string
    formatNumber(decimals?: number, precision?: number): number
  }
}

function formatString(
  num: string,
  decimals = 18,
  precision = decimals,
  delimiter = '.'
): string {
  num = num.padStart(decimals + 1, '0')
  const intPart = num.slice(0, -decimals).replace(/^0+/, '')
  const fracPart = num.slice(-decimals).padEnd(precision, '0').slice(0, precision)
  if (precision === 0) return intPart
  return (intPart ? intPart : '0') + (fracPart.length > 0 ? delimiter + fracPart : '')
}

BigNumber2.prototype.formatString = BigNumber.prototype.formatString = function (
  decimals = 18,
  precision = decimals,
  delimiter = '.'
) {
  return formatString(this.toString(), decimals, precision, delimiter)
}

BigNumber2.prototype.formatNumber = BigNumber.prototype.formatNumber = function (
  decimals = 18,
  precision = decimals
) {
  const str = this.formatString(decimals, precision)
  return Number(str)
}
