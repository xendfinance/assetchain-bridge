/// <reference types="vitest" />
import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import nodePolyfills from 'rollup-plugin-node-polyfills'

import vue from '@vitejs/plugin-vue'
import type { Plugin } from 'vue'
import inject from '@rollup/plugin-inject'

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      // Fix global is not defined error
      define: {
        global: 'globalThis',
      },
      plugins: [
        // Without this, npm run dev will output Buffer or process is not defined error
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ],
      supported: {
        bigint: true,
      },
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      // @ts-ignore
      plugins: [nodePolyfills() as Plugin, inject({ Buffer: ['buffer', 'Buffer'] })],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  plugins: [vue()],
  define: {
    'process.env': {},
  },
  // @ts-ignore
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['vue'],
  },
  module: {
    rules: [
      {
        test: /\.sass$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
          {
            loader: 'style-resources-loader',
          },
        ],
      },
    ],
  },
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: `

        `,
      },
    },
  },
})
