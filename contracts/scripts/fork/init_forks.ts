import { run } from '@/gotbit-tools/hardhat'
import { execSync } from 'child_process'
import hre from 'hardhat'

const output = execSync('ls', { encoding: 'utf-8' })

run('init forks', async () => {
  console.log()
  const name = hre.network.name
  console.log(`Forking "${name}"`)
  for (const t of ['test', 'dev', 'qa']) {
    console.log(`Creating "${t}"...`)
    const res = execSync(`npx hardhat tenderly:fork --network ${name}_${t}`)
    console.log(res.toString())
  }
  const output = execSync('npx hardhat tenderly:forks')
  console.log(output.toString())
})
