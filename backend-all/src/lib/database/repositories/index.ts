// Export all repositories here
import {TokenRepository} from './TokenRepository'
import {BridgeInfoRepository} from './BridgeInfoRepository'
import {TransactionRepository} from './TransactionRepository'
import {BlockscanInfoRepository} from './BlockscanInfoRepository'
import {UserTransactionSyncRepository} from './UserTransactionSyncRepository'

const tokenRepo = new TokenRepository()
const bridgeInfoRepo = new BridgeInfoRepository()
const transactionRepo = new TransactionRepository()
const blockscanInfoRepo = new BlockscanInfoRepository()
const userTransactionSyncRepo = new UserTransactionSyncRepository()


// Add your repository exports as you create them
export { tokenRepo, bridgeInfoRepo, transactionRepo, blockscanInfoRepo, userTransactionSyncRepo }