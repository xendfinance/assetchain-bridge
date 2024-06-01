<template>
  <div class="w-full relative z-20">
    <header
      class="w-full bg-primary-card md:bg-transparent border-b-[1px] border-b-primary-border backdrop-blur-sm transition-all ease-in-out duration-300 h-[80px] max-h-[80px] flex items-center"
    >
      <div
        class="flex justify-between items-center text-[15px] w-full max-w-[1440px] px-3 md:px-10 mx-auto"
      >
        <BaseLogo />
        <div v-if="!login" class="hidden md:block justify-self-end">
          <GButton primary size="md" @click="ui.openDialog('connectDialog', {})">
            Connect Wallet
          </GButton>
        </div>
        <div
          v-if="login"
          ref="dropdown"
          class="hidden md:flex items-center justify-end gap-5 relative justify-self-end"
        >
          <WrongNetworkIcon
            v-if="!REAL_CHAIN_IDS.includes(realChainId as ChainId) && login"
            @mouseover="isWrongMessage = true"
            @mouseleave="isWrongMessage = false"
            @click="isWrongMessage = !isWrongMessage"
          />
          <div
            v-if="
              !REAL_CHAIN_IDS.includes(realChainId as ChainId) && isWrongMessage && !menu
            "
            class="absolute left-[-150px] md:left-[-185px] top-[24px] md:top-[54px] text-[#eb5757] p-[16px] bg-[#eb57571a] rounded-lg h-[48px] w-[310px] flex items-center gap-[12px]"
          >
            <WrongNetworkIcon />
            <div class="text-start text-[13px]">An unsupported network is selected</div>
          </div>
          <div class="hidden md:flex relative">
            <UserButton
              @click="logOutPopup = !logOutPopup"
              @mouseenter="logOutPopup = true"
            />
            <Transition name="fade">
              <LogOutDropDown
                v-if="login"
                ref="dropdown"
                class="absolute translate-y-[100%] bottom-[-28px] right-[-20px] hidden md:block w-[384px]"
                :visible="logOutPopup"
                @mouseleave="logOutPopup = false"
              />
            </Transition>
          </div>

          <!-- <button @click="disconnect">
            <LogoutIcon />
          </button> -->
        </div>
        <div
          v-if="
            !REAL_CHAIN_IDS.includes(realChainId as ChainId) && isWrongMessage && !menu
          "
          class="md:hidden left-[80px] absolute top-[44px] text-[#eb5757] p-[8px] bg-[#eb57571a] rounded-lg h-[35px] w-[250px] flex items-center gap-[12px]"
        >
          <WrongNetworkIcon />
          <div class="text-start text-[11px]">An unsupported network is selected</div>
        </div>

        <div class="md:hidden flex items-center gap-[8px]">
          <div v-if="!REAL_CHAIN_IDS.includes(realChainId as ChainId) && !menu && login">
            <WrongNetworkIcon @click="isWrongMessage = !isWrongMessage" />
          </div>
          <button v-if="!menu" @click="menu = true" class="ml-auto">
            <MenuNav />
          </button>

          <div
            v-if="menu"
            class="flex items-center justify-center gap-[8px] w-full"
            :class="{ 'menu-open': menu }"
          >
            <div
              v-if="!REAL_CHAIN_IDS.includes(realChainId as ChainId) && login"
              @click="isWrongMessage = !isWrongMessage"
            >
              <WrongNetworkIcon />
            </div>
          </div>
          <button v-if="menu" @click="menu = false" class="ml-auto">
            <MenuClose />
          </button>
          <Transition name="fade">
            <div
              v-if="menu"
              class="flex flex-col md:hidden fixed right-0 p-5 w-full h-[100vh] top-[80px] bg-primary-card"
            >
              <div class="w-full flex flex-col mb-[80px] justify-end h-full">
                <LogOutDropDown
                  v-if="login"
                  :visible="login"
                  class="!w-full !min-w-full !max-w-none !bg-transparent !p-0 flex-grow"
                  @disconnect="menu = false"
                />
                <!-- <div v-if="login">
                  <GButton outline class="w-full">{{ walletLabel }}</GButton>
                  <div
                    @click="disconnect()"
                    class="flex md:hidden items-center mt-[24px] w-full justify-center gap-4"
                  >
                    <span class="text-base">Exit</span>
                    <LogoutIcon />
                  </div>
                </div> -->
                <div v-else class="w-full flex flex-col mb-[80px] justify-end h-full">
                  <GButton
                    primary
                    class="w-full"
                    @click="
                      () => {
                        ui.openDialog('connectDialog', {})
                        menu = false
                      }
                    "
                  >
                    Connect Wallet
                  </GButton>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import MenuClose from '@/components/base/icons/MenuClose.vue'
import MenuNav from '@/components/base/icons/MenuNav.vue'
import LogOutDropDown from '@/components/bridge/LogOutDropDown.vue'
import GButton from '@/components/gotbit-ui-kit/GButton.vue'
import LogoutIcon from '@/components/gotbit-ui-kit/icons/LogoutIcon.vue'
import WrongNetworkIcon from '@/components/gotbit-ui-kit/icons/WrongNetworkIcon.vue'
import { useWallet, useWeb3 } from '@/gotbit-tools/vue'
import { ChainId } from '@/gotbit-tools/vue/types'
import { useDialogs } from '@/store/ui/dialogs'
import { computed, reactive, ref } from 'vue'
import { REAL_CHAIN_IDS } from '@/misc/chains'
import { onClickOutside } from '@vueuse/core'
import UserButton from '@/components/base/UserButton.vue'
import BaseLogo from '@/components/nav/Logo.vue'

const { login, disconnect, walletLabel } = useWallet()

const ui = useDialogs()
const web3 = useWeb3()

const menu = ref(false)
const logOutPopup = ref(false)
const isWrongMessage = ref(false)
const dropdown = ref<HTMLElement | any>(null)

const realChainId = computed(() => web3.realChainId?.toString())

onClickOutside(dropdown, () => {
  if (logOutPopup.value) logOutPopup.value = false
})
</script>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.router-link-exact-active {
  @media (min-width: 1024px) {
    padding-top: 2px;
    border-bottom: 2px solid #2aa0f8;
    font-weight: 700;
    color: white;
  }
}

.popup-gradient {
  background: linear-gradient(170deg, #003357 0%, #011a3a 45.6%, #011734 94.79%);
  @media (min-width: 768px) {
    background-color: #094b7e;
  }
}
</style>
