const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const config = require('../../../fork.json')

const command = (rpc) =>
  `SCRIPT=./src/gotbit-tools/scripts/shell/run-node.sh yarn script ${rpc}`

function main() {
  const c = command(config.rpc)
  console.log(c)
  exec(c)
}

main()
