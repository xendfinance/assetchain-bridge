import { BigNumber } from 'ethers'
import moment from 'moment'

import { config } from '@/gotbit.config'
import { Address } from '../utils/address'

declare global {
  interface String {
    toBigNumber(decimals?: number): BigNumber
    cutZeros(): string
    shortAddress(start?: number, end?: number): string
    validNumber(params?: Parameters<typeof validateNumber>[1]): boolean
    toAddress(): Address
  }
  interface Number {
    toDate(format: string): string
  }

  interface Window {
    debugOn: () => void
    debugOff: () => void
    pretend: <ChainId extends string>(address: string, chainId?: ChainId) => void
  }
  interface Console {
    always: {
      log: (message?: any, ...optionalParams: any[]) => void
      error: (message?: any, ...optionalParams: any[]) => void
      warn: (...data: any[]) => void
      table: (tabularData: any, properties?: ReadonlyArray<string>) => void
      group: (...data: any[]) => void
      groupEnd: () => void
    }
    gotbit: {
      log: (message?: any, ...optionalParams: any[]) => void
      error: (message?: any, ...optionalParams: any[]) => void
      warn: (...data: any[]) => void
      table: (tabularData: any, properties?: ReadonlyArray<string>) => void
      group: (...data: any[]) => void
      groupEnd: () => void
    }
  }
}

function toBigNumber(num: string, decimals = 18, delimiter = '.'): string {
  num = num.split('_').join('')
  if (num.split(delimiter).length === 1)
    return num.padEnd(decimals + num.split(delimiter)[0].length, '0')
  const intPart = num.split(delimiter)[0]
  const fracPart = num.split(delimiter)[1].padEnd(decimals, '0').slice(0, decimals)
  return intPart + fracPart
}

/**
 * Validate number input. By default, any **positive**, **non-zero** number consisting only of `0-9` and maybe `.` dot character
 * @param num Input string
 * @param params Override default params
 * @returns true / false
 */
export function validateNumber(
  num: string,
  params = {} as {
    /** Forbid float. Default: false */
    nofloat?: boolean
    /** Allow zero value. Default: false */
    allowzero?: boolean
    /** Allow negative value. Default: false */
    allownegative?: boolean
  },
) {
  const n = Number(num)
  console.log({ params })
  return (
    !isNaN(n) &&
    !(n === 0 && !params.allowzero) &&
    !!num.match(
      new RegExp(
        `^${params.allownegative ? '-?' : ''}\\d+${!params.nofloat ? '(\\.\\d+)?' : ''}$`,
      ),
    )
  )
}

String.prototype.toAddress = function () {
  return new Address(String(this))
}

String.prototype.validNumber = function (params?: Parameters<typeof validateNumber>[1]) {
  const str = String(this)
  return validateNumber(str, params)
}

String.prototype.toBigNumber = function (decimals = 18, delimiter = '.') {
  return BigNumber.from(toBigNumber(String(this), decimals, delimiter))
}

String.prototype.cutZeros = function () {
  return String(this).replace(/\.?0+$/, '')
}
String.prototype.shortAddress = function (start = 6, end = start - 2) {
  const str = String(this)
  return str.slice(0, start) + '...' + str.slice(-end)
}

Number.prototype.toDate = function (format: string) {
  const num = Number(this)
  return moment(num * 1000).format(format)
}

const GOTBIT_TOOLS_LABEL = '[gotbit-tools] '

console.gotbit = {
  log: (message?: any, ...optionalParams: any[]) =>
    console.log(GOTBIT_TOOLS_LABEL + message, ...optionalParams),
  error: (message?: any, ...optionalParams: any[]) =>
    console.error(GOTBIT_TOOLS_LABEL + message, ...optionalParams),
  warn: (...data: any[]) => console.warn(GOTBIT_TOOLS_LABEL, ...data),
  table: (tabularData: any, properties?: ReadonlyArray<string>) =>
    console.table(tabularData, properties),
  group: (...data: any[]) =>
    console.group(GOTBIT_TOOLS_LABEL + data[0], ...data.slice(1)),
  groupEnd: () => console.groupEnd(),
}

console.always = {
  ...console,
}

if (!config.DEBUG) {
  console.gotbit.log = (message?: any, ...optionalParams: any[]) => null
  console.gotbit.error = (message?: any, ...optionalParams: any[]) => null
  console.gotbit.warn = (...data: any[]) => null
  console.gotbit.table = (tabularData: any, properties?: ReadonlyArray<string>) => null
  console.gotbit.group = (...data: any[]) => null
  console.gotbit.groupEnd = () => null

  console.log = (message?: any, ...optionalParams: any[]) => null
  console.error = (message?: any, ...optionalParams: any[]) => null
  console.warn = (...data: any[]) => null
  console.table = (tabularData: any, properties?: ReadonlyArray<string>) => null
  console.group = (...data: any[]) => null
  console.groupEnd = () => null
}
