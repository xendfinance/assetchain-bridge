<template>
  <div
    v-if="fork.isOpen"
    class="w-[400px] h-[300px] absolute right-0 bottom-0 bg-purple-200 flex justify-center items-center rounded-md p-4 flex-col space-y-10 shadow-black shadow-lg"
    style="z-index: 9999"
  >
    <template v-if="fork.newTx">
      <div class="text-lg font-bold">New transcation</div>
      <div>from: {{ web3.wallet.shortAddress() }}</div>
      <div class="flex justify-around w-full">
        <Button @click="fork.acceptTx()" class="h-[40px]">Accept</Button>
        <Button @click="fork.cancelTx()" class="h-[40px]">Cancel</Button>
      </div>
    </template>
    <template v-if="fork.requestWallet">
      address: <input type="text" v-model="address" />
      <div class="flex justify-around w-full">
        <Button
          @click="
            () => {
              web3.pretend(address)
              fork.requestWallet = false
            }
          "
          class="h-[40px]"
          >Accept</Button
        >
        <Button @click="fork.requestWallet = false" class="h-[40px]">Cancel</Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Button from './Button.vue'
import { useWeb3 } from '../utils/stores/web3'
import { useFork } from '../utils/stores/fork'
import { ref } from 'vue'
const web3 = useWeb3()
const fork = useFork()

const address = ref()
</script>
