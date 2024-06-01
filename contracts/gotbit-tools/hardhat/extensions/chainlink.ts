import { BigNumberish, ethers, Contract, ContractTransaction, constants } from 'ethers'
import { extendEnvironment } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

export const eventRandomnessABI = [
  'event RandomnessRequest(bytes32 keyHash, uint256 seed, bytes32 indexed jobID, address sender, uint256 fee, bytes32 requestID)',
]

export class ChainlinkPlugin {
  hre: HardhatRuntimeEnvironment

  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre
  }

  async fulfillRandomness(
    contract: Contract,
    vrfAddress: string,
    requestRandomnessTx: ContractTransaction,
    randomness = 1 as BigNumberish
  ) {
    const receiptTx = await requestRandomnessTx.wait()
    let iface = new ethers.utils.Interface(eventRandomnessABI)

    let requestId
    for (const log of receiptTx.logs) {
      try {
        const event = iface.parseLog(log)
        requestId = event.args[event.args.length - 1]
      } catch (e) {}
    }

    const vrf = await this.hre.fork.utils.getSigner(vrfAddress)
    await this.hre.fork.setBalance(vrf.address, '1'.toBigNumber(18))
    await contract.connect(vrf).rawFulfillRandomness(requestId, randomness)
  }
}

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    chainlink: ChainlinkPlugin
  }
}

extendEnvironment((hre) => {
  hre.chainlink = new ChainlinkPlugin(hre)
})
