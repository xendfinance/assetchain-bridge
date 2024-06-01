import { task } from 'hardhat/config'
import { accounts, fork, forks, push, verify, checkpoint } from './controllers'
import { tenderlyTask } from './utils'

tenderlyTask('push', 'Push contracts on tenderly', async (_, hre) => await push(hre))

tenderlyTask('verify', 'Verify contracts on fork', async (_, hre) => await verify(hre))

tenderlyTask('fork', 'Create fork', async (_, hre) => await fork(hre))

tenderlyTask('forks', 'Print forks', async (_, hre) => await forks(hre))

tenderlyTask('accounts', 'Print accounts', async (_, hre) => await accounts(hre))

tenderlyTask(
  'checkpoint',
  'Checkpoint state of blockchain',
  async (_, hre) => await checkpoint(hre)
)

task('tenderly:fill', 'Send ETH to account')
  .addParam('account', "The account's address")
  .setAction(async (taskArgs: { account: string }, hre) => {
    console.log(`Adding native to ${taskArgs.account}...`)
    await hre.tenderly.addBalance([taskArgs.account], '10'.toBigNumber(18))
    console.log('Done')
  })
