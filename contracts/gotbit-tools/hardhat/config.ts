import { defineConfig } from './utils/misc'
export { defineConfig }

export const parsePrivates = (keys?: string) => {
  return keys ? keys.split(',') : []
}
