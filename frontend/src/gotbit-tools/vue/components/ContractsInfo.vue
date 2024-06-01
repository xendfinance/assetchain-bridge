<template>
  <div class="min-h-screen bg-slate-200">
    <header
      class="h-[70px] bg-white rounded-b-lg shadow-sm flex items-center px-[10px] relative"
    >
      <button
        class="w-[100px] h-1/2 bg-blue-300 rounded-md shadow-md text-white"
        @click="$router.push('/')"
      >
        Go home
      </button>

      <div class="absolute text-xl -translate-x-1/2 left-1/2">Contracts' info</div>
    </header>
    <main class="w-full h-[20px] grid grid-cols-1 md:grid-cols-3 md:gap-3 gap-y-3 cont">
      <div class="flex flex-col cont card">
        <select v-model="chainId">
          <option v-for="chainId of config.chainIds" :key="chainId" :value="chainId">
            {{ getChainTag(chainId) }}
          </option>
        </select>
        <input
          type="text"
          v-model="address"
          class="px-2 border-2 border-blue-300 rounded-lg"
          :class="{
            '!border-red-300': error,
          }"
        />
        <div v-if="error" class="text-red-600">
          {{ error }}
        </div>
        <button
          @click="paste"
          class="w-[100px] h-1/2 bg-blue-300 rounded-md shadow-md text-white"
        >
          Paste
        </button>

        <button
          class="w-[100px] h-1/2 bg-blue-300 rounded-md shadow-md text-white"
          :disabled="Boolean(error) || !Boolean(address)"
          :class="{
            'opacity-50': error || !address,
          }"
          @click="web3.pretend(address, chainId)"
        >
          Pretend
        </button>
      </div>
      <div class="col-span-2 cont card">
        <section v-for="chainName of chainNames" :key="chainName">
          {{ contracts[chainName].chainId }})
          {{ chainName }}
          <code>
            <div
              v-for="contract of Object.keys(contracts[chainName].contracts)"
              :key="contract"
              class="pl-5"
            >
              {{ contract }}:
              <a
                class="text-blue-700 underline"
                :href="
                  getAddress(
                    contracts[chainName].chainId,
                    contracts[chainName].contracts[contract],
                  )
                "
                >{{ contracts[chainName].contracts[contract] }}</a
              >
            </div>
          </code>
        </section>
      </div>
      <div class="col-span-3 cont card">
        <section v-for="chainId of config.chainIds" :key="chainId">
          <span class="font-bold">{{ getChainDescription(chainId).name }}</span
          >: <span class="text-blue-500">{{ getChainRpc(chainId) }}</span>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { utils } from 'ethers'

import {
  scannersLink,
  getChainTag,
  getChainRpc,
  getChainDescription,
} from '../utils/info'
import { getContracts } from '../utils/dev'
import type { ChainId } from '../utils/types'
import { useWeb3 } from '../utils/stores/web3'
import { node } from '../utils/node'

import { config } from '@/gotbit.config'

const web3 = useWeb3()
const contracts = getContracts()
const chainNames = Object.keys(contracts).filter((c) =>
  config.chainIds.includes(contracts[c].chainId as ChainId),
) as ChainId[]

function getAddress(chainId: string, address: string) {
  return scannersLink.getAddress(chainId as ChainId, address)
}

const address = ref('')
const chainId = ref<ChainId>(config.DEFAULT_CHAINID)
const error = ref('')

watch(address, (newValue) => {
  if (!utils.isAddress(newValue)) error.value = 'Incorrect address'
  else error.value = ''
})

async function paste() {
  const text = await navigator.clipboard.readText()
  address.value = text
}
</script>

<style lang="scss" scoped>
.cont {
  padding: 20px;

  &.card {
    border-radius: 6px;
    background-color: white;
  }
}
</style>
