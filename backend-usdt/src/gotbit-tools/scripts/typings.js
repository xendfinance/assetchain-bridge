// import type { Token, Vesting } from './typechain'

// export type ContractInterface<Name> =
//   Name extends 'Token'
//   ? Token:
//   : Name extends 'Vesting'
//   ? Vesting:
//   any

const fs = require('fs')
const path = require('path')
const contractsJSON = require('../../contracts/contracts.json')

const CONTRACTS_PATH = path.join(__dirname, '../../contracts/')

let deployedContracts = []
for (const chain of Object.keys(contractsJSON)) {
  const cs = Object.keys(contractsJSON[chain][0].contracts)
  deployedContracts = [...deployedContracts, ...cs]
}

deployedContracts = Array.from(new Set(deployedContracts))

const typechainContracts = fs
  .readdirSync(path.join(CONTRACTS_PATH, 'typechain/'))
  .map((n) => n.split('.d.ts')[0])
  .filter((n) => !n.includes('.'))

let intersect = new Set(
  typechainContracts.filter((i) => new Set(deployedContracts).has(i))
)
save(Array.from(intersect))

function save(c) {
  let file = `import type { ${c.join(', ')} } from './typechain'
export type TypedInterface = '${c.join("' | '")}'
export type ContractInterface<Name> =\n`
  for (const name of c) {
    file =
      file +
      `  Name extends '${name}'
  ? ${name} :\n`
  }

  file = file + '  never'

  fs.writeFileSync(path.join(CONTRACTS_PATH, 'typings.ts'), file)
}
