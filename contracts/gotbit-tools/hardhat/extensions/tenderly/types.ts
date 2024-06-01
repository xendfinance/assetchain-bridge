export interface Forks {
  simulation_forks: SimulationFork[]
}
export interface Fork {
  simulation_fork: SimulationFork
}

export interface SimulationFork {
  id: string
  project_id: string
  alias: string
  network_id: string
  block_number: number
  transaction_index: number
  chain_config: ChainConfig
  fork_config: null
  created_at: Date
  accounts: Record<string, string>
  global_head?: string
}

export interface ChainConfig {
  type: string
  chain_id: number
  homestead_block: number
  eip_150_Block: number
  eip_150_Hash: string
  eip_155_block: number
  eip_158_block: number
  byzantium_block: number
  constantinople_block: number
  istanbul_block: number
  muir_glacier_block: number
}
