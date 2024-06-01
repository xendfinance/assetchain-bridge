// balance contracts

const fs = require('fs')
const path = require('path')
const contractsJSON = require('../../contracts/contracts.json')
const CONTRACTS_PATH = path.join(__dirname, '../../contracts/contracts.json')

const allContracts = {}

for (const chain of Object.keys(contractsJSON))
  for (const name of Object.keys(contractsJSON[chain][0].contracts))
    allContracts[name] = {
      ...contractsJSON[chain][0].contracts[name],
      address: '0x0000000000000000000000000000000000000000',
    }

const names = []

const newContracts = { ...contractsJSON }

for (const chain of Object.keys(newContracts)) {
  newContracts[chain][0].contracts = {
    ...allContracts,
    ...newContracts[chain][0].contracts,
  }
}

fs.writeFileSync(CONTRACTS_PATH, JSON.stringify(newContracts, undefined, 2))
