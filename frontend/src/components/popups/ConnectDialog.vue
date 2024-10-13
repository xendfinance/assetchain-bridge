<template>
  <div class="connect-dialog">
    <div class="title">
      <h1 class="text-[23px] md:text-[32px] font text-primary-text">Connect wallet</h1>
      <div class="text-[16px] text-label-text max-w-[400px] w-full text-center">
        Choose your wallet provider to access more functionality
      </div>
    </div>
    <div class="w-full mt-[24px] md:mt-[40px] flex flex-col items-center gap-5">
      <GButton
        secondary
        @click="
          () => {
            connectMetamask()
            dialogs.closeCurrentDialog()
          }
        "
        class="w-full h-[50px]"
      >
        <div
          class="flex items-center justify-center gap-2 font-medium w-full text-[16px] h-full z-30 button-text"
        >
          <MetamaskIcon class="hidden md:block" size="24px" />
          <MetamaskIcon class="md:hidden block" size="24px" />
          MetaMask
        </div>
      </GButton>

      <GButton
        secondary
        @click="
          () => {
            connectWalletconnect()
            dialogs.closeCurrentDialog()
          }
        "
        class="w-full h-[50px]"
      >
        <div
          class="flex items-center justify-center font-medium gap-2 w-full text-[16px] h-full z-30 button-text"
        >
          <WalletConnectIcon class="hidden md:block" size="24px" />
          <WalletConnectIcon class="md:hidden block" size="24px" />
          WalletConnect
        </div>
      </GButton>
      <GButton
        secondary
        @click="
          () => {
            connectMadWallet()
            dialogs.closeCurrentDialog()
          }
        "
        class="w-full h-[50px]"
      >
        <div
          class="flex items-center justify-center font-medium gap-2 w-full text-[16px] h-full z-30 button-text"
        >
          <MadWalletIcon class="hidden md:block w-[24px] h-[24px]" />
          <MadWalletIcon class="md:hidden block w-[24px] h-[24px]" />
          MAD Wallet
        </div>
      </GButton>
      <GButton
        secondary
        @click="
          () => {
            connectCoinbase()
            dialogs.closeCurrentDialog()
          }
        "
        class="w-full h-[50px]"
      >
        <div
          class="flex items-center justify-center font-medium gap-2 w-full text-[16px] h-full z-30 button-text"
        >
          <CoinbaseIcon class="hidden md:block" />
          <CoinbaseIcon class="md:hidden block" size="24px" />
          Coinbase
        </div>
      </GButton>
      <div class="w-full hidden md:block">
        <GButton
          secondary
          @click="
            () => {
              connectTrustWallet()
              dialogs.closeCurrentDialog()
            }
          "
          class="w-full h-[50px]"
        >
          <div
            class="flex items-center justify-center font-medium gap-2 w-full text-[16px] h-full z-30 button-text"
          >
            <TrustWalletIcon class="hidden md:block" />
            <TrustWalletIcon class="md:hidden block" size="24px" />
            Trust wallet
          </div>
        </GButton>
      </div> 
      <GButton
        secondary
        @click="
          () => {
            connectOKXWallet()
            dialogs.closeCurrentDialog()
          }
        "
        class="w-full h-[50px]"
      >
        <div
          class="flex items-center justify-center font-medium gap-2 w-full text-[16px] h-full z-30 button-text"
        >
          <OKXWalletIcon class="hidden md:block w-[24px] h-[24px]" />
          <OKXWalletIcon class="md:hidden block w-[24px] h-[24px]" size="24px" />
          OKX Wallet
        </div>
      </GButton>
      
      
      
    </div>
  </div>
</template>

<script setup lang="ts">
import MetamaskIcon from '@/components/base/icons/MetamaskIcon.vue'
import WalletConnectIcon from '@/components/base/icons/WalletConnectIcon.vue'
import CoinbaseIcon from '@/components/gotbit-ui-kit/icons/CoinbaseIcon.vue'
import GButton from '@/components/gotbit-ui-kit/GButton.vue'
import TrustWalletIcon from '@/components/gotbit-ui-kit/icons/TrustWalletIcon.vue'
import OKXWalletIcon from '@/components/gotbit-ui-kit/icons/OKXWalletIcon.vue'
import MadWalletIcon from '@/components/gotbit-ui-kit/icons/MadWalletIcon.vue'

import { useWallet } from '@/gotbit-tools/vue'
import { useDialogs } from '@/store/ui/dialogs'
import { onMounted, ref } from 'vue'

const {
  connectMetamask,
  connectWalletconnect,
  connectCoinbase,
  connectTrustWallet,
  connectOKXWallet,
  connectMadWallet,
} = useWallet()
const dialogs = useDialogs()

const isMobile = ref(false)

onMounted(() => {
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
      navigator.userAgent,
    )
  ) {
    isMobile.value = true
  }
})

const checkOkxAgent = () => {
  if (isMobile.value && !Boolean((window as any).okxwallet?.isOkxWallet)) {
    window.open(
      'https://www.okx.com/download?deeplink=okx%3A%2F%2Fwallet%2Fdapp%2Fdetails%3FdappUrl%3Dhttps%3A%2F%2Fwww.okx.com%2Fweb3',
    )
    // window.open('https://metamask.app.link/dapp/ dyme propd link /')
  } else {
    connectOKXWallet()
    dialogs.closeCurrentDialog()
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/config.scss';

.connect-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
}

</style>
