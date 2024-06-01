import { run } from '@/gotbit-tools/hardhat'
import { execSync } from 'child_process'
import project from '@/__project__.json'

run('verify all contracts', async () => {
  const networks = project.networks

  for (const network of networks) {
    console.log('Verify... on', network)
    const res = execSync(`yarn verify --network ${network}`)
    console.log(res.toString())
    console.log('Done', network)
  }
})
