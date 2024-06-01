declare module 'hardhat/types/config' {
  export interface HardhatUserConfig {
    tenderly?: { project: string }
  }

  export interface HardhatConfig {
    tenderly?: { project: string }
  }
}

import './tasks'
import './extension'
