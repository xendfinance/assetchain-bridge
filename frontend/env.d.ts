/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_BACKEND_LINK: string
  readonly VITE_BACKEND_LINK_USDT: string
  readonly VITE_BACKEND_LINK_USDC: string
  readonly VITE_BACKEND_LINK_RWA: string
  readonly VITE_BACKEND_LINK_WETH: string
  readonly VITE_BACKEND_LINK_WNT: string
  readonly VITE_DEBUG: string
  readonly VITE_OFF_STORE: string
  readonly VITE_FORK: string
  readonly VITE_MODE?: 'qa' | 'dev' | 'test'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
