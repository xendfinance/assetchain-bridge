import { run } from '@/gotbit-tools/hardhat'
import { execSync } from 'child_process'
import hre from 'hardhat'

const output = execSync('ls', { encoding: 'utf-8' })

run('deploy all forks', async () => {
  const name = hre.network.name
  console.log(`Deploying "${name}"`)
  for (const t of ['test', 'dev', 'qa']) {
    console.log(`Deploying "${t}"...`)
    const res = execSync(`yarn deploy --network ${name}_${t}`)
    console.log(res.toString())
  }
})
