import { useContracts } from '@/gotbit-tools/vue'
import { REAL_CHAIN_IDS } from './chains'
import { LegitChainIds } from '@/gotbit-tools/vue/utils/contracts/use'
import { XEND_CHAIN } from '@/gotbit.config'
import { ChainId } from '@/gotbit-tools/vue/types'

export const formatDate = (timestamp: number) => {
  return (
    Intl.DateTimeFormat('en-GB').format(timestamp * 1000) +
    '  ' +
    Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hour12: false,
      minute: 'numeric',
    }).format(timestamp * 1000)
  )
}

export const formatObjectDate = (date: Date) => {
  return (
    Intl.DateTimeFormat('en-GB').format(date) +
    '  ' +
    Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hour12: false,
      minute: 'numeric',
    }).format(date)
  )
}

export const genPerChainId = <T>(content: () => T) => {
  const ans: Record<string, T> = {}
  for (const chainId of REAL_CHAIN_IDS) {
    ans[chainId] = content()
  }
  return ans
}

// export const formatBigNums = (number: number) => {
//   const num = number.toString()

//   const floorNum = num.split('.')[0]

//   let wholePath = floorNum.length % 3

//   let stringPath = (floorNum.length - wholePath) / 3

//   if (wholePath === 0 && stringPath > 1) {
//     wholePath = 3
//     stringPath -= 1
//   }
//   if (wholePath === 0 && stringPath === 1) stringPath = 0
//   switch (stringPath) {
//     case 0: {
//       return num
//     }
//     case 1: {
//       return num.slice(0, wholePath) + ' ' + 'k'
//     }
//     case 2: {
//       return num.slice(0, wholePath) + ' ' + 'M'
//     }
//     case 3: {
//       return num.slice(0, wholePath) + ' ' + 'B'
//     }
//     case 4: {
//       return num.slice(0, wholePath) + ' ' + 'T'
//     }
//     case 5: {
//       return num.slice(0, wholePath) + ' ' + 'qd'
//     }
//     case 6: {
//       return num.slice(0, wholePath) + ' ' + 'Qn'
//     }
//     case 7: {
//       return num.slice(0, wholePath) + ' ' + 'sx'
//     }
//     case 8: {
//       return num.slice(0, wholePath) + ' ' + 'Sp'
//     }
//     case 9: {
//       return num.slice(0, wholePath) + ' ' + 'O'
//     }
//     case 10: {
//       return num.slice(0, wholePath) + ' ' + 'N'
//     }
//   }
//   return '0'
// }
export const formatBigNums = (number: number | string) => {
  const num = number.toString()
  const decimalIndex = num.indexOf('.')
  const isDecimal = decimalIndex !== -1

  let floorNum
  let decimalPart = ''

  if (isDecimal) {
    floorNum = num.slice(0, decimalIndex)
    decimalPart = num.slice(decimalIndex + 1, decimalIndex + 4)
  } else {
    floorNum = num
  }

  let wholePath = floorNum.length % 3
  let stringPath = (floorNum.length - wholePath) / 3

  if (wholePath === 0 && stringPath > 1) {
    wholePath = 3
    stringPath -= 1
  }
  if (wholePath === 0 && stringPath === 1) stringPath = 0

  const floorLen = floorNum.slice(0, wholePath).length
  const dec =
    floorNum.slice(floorLen, wholePath + 2) === '00'
      ? ``
      : `.${floorNum.slice(floorLen, wholePath + 2)}`

  switch (stringPath) {
    case 0: {
      if (isDecimal) {
        return floorNum + '.' + decimalPart
      }
      return num
    }
    case 1: {
      return floorNum.slice(0, wholePath) + dec + ' ' + 'k'
    }
    case 2: {
      return floorNum.slice(0, wholePath) + dec + ' ' + 'M'
    }
    case 3: {
      return floorNum.slice(0, wholePath) + dec + ' ' + 'B'
    }
    case 4: {
      return floorNum.slice(0, wholePath) + dec + ' ' + 'T'
    }
    case 5: {
      return floorNum.slice(0, wholePath) + dec + ' ' + 'qd'
    }
    case 6: {
      return floorNum.slice(0, wholePath) + dec + ' ' + 'Qn'
    }
    case 7: {
      return floorNum.slice(0, wholePath) + dec + ' ' + 'sx'
    }
    case 8: {
      return floorNum.slice(0, wholePath) + dec + ' ' + 'Sp'
    }
    case 9: {
      return floorNum.slice(0, wholePath) + dec + ' ' + 'O'
    }
    case 10: {
      return floorNum.slice(0, wholePath) + dec + ' ' + 'N'
    }
  }
  return '0'
}

export const DEFAULT_NATIVE_TOKEN_CONTRACT_1 =
  '0x0000000000000000000000000000000000000000'
export const DEFAULT_NATIVE_TOKEN_CONTRACT_2 =
  '0x0000000000000000000000000000000000000001'

export const getContract = (chainId: ChainId) => {
  if (chainId === XEND_CHAIN) {
    const { BridgeAssistNative } = useContracts(undefined, chainId)
    const { anyBridgeAssistMint } = useContracts(undefined, chainId)
    const { anyToken } = useContracts(undefined, chainId)
    const { bridgeFactory } = useContracts(undefined, chainId)

    return {
      anyBridgeAssist: anyBridgeAssistMint,
      briggeAssistNative: BridgeAssistNative,
      bridgeFactory: bridgeFactory,
      anyToken: anyToken,
    }
  } else {
    const { anyBridgeAssist } = useContracts(undefined, chainId)
    const { anyToken } = useContracts(undefined, chainId)
    const { bridgeFactory } = useContracts(undefined, chainId)
    // anyBridgeAssist('').supportedChainList
    return {
      anyBridgeAssist: anyBridgeAssist,
      bridgeFactory: bridgeFactory,
      anyToken: anyToken,
    }
  }
}
