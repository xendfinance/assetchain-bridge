import './types/bignumber'
import './types/global'

import * as dotenv from 'dotenv'
dotenv.config()

import { debugInfo } from '.'
debugInfo()

import { checkRpc } from './utils/rpcChecker'
checkRpc()
