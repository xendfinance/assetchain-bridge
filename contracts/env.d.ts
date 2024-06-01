declare namespace NodeJS {
  export interface ProcessEnv {
    API_ETH?: string
    API_BSC?: string
    API_POLYGON?: string
    API_AVAX?: string
    API_FTM?: string
    API_ARBITRUM?: string

    PRIVATE_TEST?: string
    PRIVATE_MAIN?: string

    PRIVATE_REMOTE_DEV?: string
    PRIVATE_REMOTE_TEST?: string
    PRIVATE_REMOTE_QA?: string
  }
}
