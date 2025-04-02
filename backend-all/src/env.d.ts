declare namespace NodeJS {
  export interface ProcessEnv {
    TEST: string
    PRIVATE_KEY: string
    RELAYER1_URL: string
    RELAYER2_URL: string
    IS_PUBLIC_RELAYER: string
  }
}
