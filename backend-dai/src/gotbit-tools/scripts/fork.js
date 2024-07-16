const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const FORK_CONFIG = '../../../fork.config'

const command = (rpc) =>
  `SCRIPT=./src/gotbit-tools/scripts/shell/run-node.sh yarn script ${rpc}`

function toObj(config) {
  const out = {}
  for (const line of config.split('\n')) {
    const [name, value] = line.split('=')
    out[name] = value
  }
  return out
}

function main() {
  const content = fs.readFileSync(path.join(__dirname, FORK_CONFIG)).toString()
  const config = toObj(content)
  const c = command(config.rpc)
  console.log(c)
  exec(c)
}

main()
