import { extendEnvironment } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const SNAPSHOT = 'evm_snapshot'
const REVERT = 'evm_revert'
const INCREASE_TIME = 'evm_increaseTime'
const SET_NEXT_BLOCK_TIMESTAMP = 'evm_setNextBlockTimestamp'
const MINE = 'evm_mine'

export type Snapshot = string

export class TimePlugin {
  hre: HardhatRuntimeEnvironment

  methods = {
    SNAPSHOT,
    REVERT,
    INCREASE_TIME,
    MINE,
    SET_NEXT_BLOCK_TIMESTAMP,
  }

  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre
  }
  /**
   * Snapshot the state of the blockchain at the current block. Takes no parameters.
   *
   * @returns the integer id of the snapshot created.
   */
  async snapshot(): Promise<Snapshot> {
    return await this.hre.network.provider.send(this.methods.SNAPSHOT)
  }

  /**
   * Revert the state of the blockchain to a previous snapshot.
   * Takes a single parameter, which is the snapshot id to revert to.
   * If no snapshot id is passed it will revert to the latest snapshot.
   *
   * @param snapId
   *
   * @returns true
   */
  async revert(snapId: Snapshot): Promise<boolean> {
    return await this.hre.network.provider.send(this.methods.REVERT, [snapId])
  }

  /**
   * Jump forward in time.
   * Takes one parameter, which is the amount of time to increase in seconds.
   *
   * @param seconds
   *
   * @retruns the total time adjustment, in seconds.
   */
  async increaseTime(seconds: number): Promise<number> {
    return await this.hre.network.provider.send(this.methods.INCREASE_TIME, [seconds])
  }

  /**
   * Force a block to be mined. Takes no parameters.
   * Mines a block independent of whether or not mining is started or stopped.
   */
  async mine() {
    await this.hre.network.provider.send(this.methods.MINE)
  }

  async setNextBlockTimestamp(timestamp: number) {
    await this.hre.network.provider.send(this.methods.SET_NEXT_BLOCK_TIMESTAMP, [
      timestamp,
    ])
  }
}

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    time: TimePlugin
  }
}

extendEnvironment((hre) => {
  hre.time = new TimePlugin(hre)
})
