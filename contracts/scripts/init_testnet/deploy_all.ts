import { run } from '@/gotbit-tools/hardhat'
import { execSync } from 'child_process'
import project from '@/__project__.json'

run('deploy all contracts', async () => {
  const networks = project.networks

  execSync(`yarn compile`)
  for (const network of networks) {
    console.log('Deploying... on', network)
    const res = execSync(`yarn deploy --network ${network} --no-compile`)
    console.log(res.toString())
    console.log('Done', network)
  }
})
