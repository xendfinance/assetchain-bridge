import { BigNumber } from 'ethers'

declare module 'ethers' {
  interface BigNumber {
    formatString(decimals?: number, precision?: number, delimiter?: string): string
    formatNumber(decimals?: number, precision?: number): number
  }
}

function formatString(
  num: string,
  decimals = 18,
  precision = decimals,
  delimiter = '.'
): string {
  if (decimals === 0) return num
  num = num.padStart(decimals + 1, '0')

  const intPart = num.slice(0, -decimals).replace(/^0+/, '')
  if (precision === 0) return intPart ? intPart : '0'

  const fracPart = num.slice(-decimals).slice(0, precision).replace(/0+$/, '')

  return (intPart ? intPart : '0') + (fracPart.length > 0 ? delimiter + fracPart : '')
}

BigNumber.prototype.formatString = function (
  decimals = 18,
  precision = decimals,
  delimiter = '.'
) {
  return formatString(this.toString(), decimals, precision, delimiter)
}

BigNumber.prototype.formatNumber = function (decimals = 18, precision = decimals) {
  const str = this.formatString(decimals, precision)
  return Number(str)
}
