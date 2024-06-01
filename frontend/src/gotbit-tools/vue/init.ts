import './types/bignumber'
import './types/global'

import { debugInfo } from '.'
debugInfo()

import { setMulticallAddress } from 'ethers-multicall'
setMulticallAddress(43113, '0xA4D6429128EC1aDC42CCF13743Db0BB4341f7911')
