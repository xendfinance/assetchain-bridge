import {BridgeService} from './bridge'
import {TokenService} from './token'

const tokenService = new TokenService()
const bridgeService = new BridgeService()

export {tokenService, bridgeService}