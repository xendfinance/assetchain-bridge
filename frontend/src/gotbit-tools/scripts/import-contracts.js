const fs = require('fs')
const {
  CONTRACTS_PATH,
  SOURCE_TYPECHAIN_PATH,
  SOURCE_CONTRACTS_JSON_PATH,
  TARGET_TYPECHAIN_PATH,
  TARGET_CONTRACTS_JSON_PATH,
} = require('./constants')

function main() {
  if (fs.existsSync(CONTRACTS_PATH))
    fs.rmSync(CONTRACTS_PATH, { recursive: true, force: true })
  fs.mkdirSync(CONTRACTS_PATH)
  fs.cpSync(SOURCE_TYPECHAIN_PATH, TARGET_TYPECHAIN_PATH, { recursive: true })
  // const contracts = JSON.parse(fs.readFileSync(SOURCE_CONTRACTS_JSON_PATH).toString())
  // const newContracts = {}
  // console.log({ contracts })

  // for (const chainId in contracts) {
  // if (chainId.startsWith('10000')) {
  //   const newChainId = chainId.slice(5)
  //   newContracts[newChainId] = contracts[chainId]
  //   newContracts[newChainId][0].chainId = newChainId
  //   newContracts[newChainId][0].name = newContracts[newChainId][0].name.slice(0, -7)
  // } else {
  // }
  // }
  fs.cpSync(SOURCE_CONTRACTS_JSON_PATH, TARGET_CONTRACTS_JSON_PATH)
}

main()
