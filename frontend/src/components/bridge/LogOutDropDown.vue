<template>
  <div
    v-if="props.visible"
    class="md:rounded-[16px] w-full md:max-w-[384px] md:bg-select-drop p-5 md:p-8 md:border border-primary-border-card flex flex-col justify-between"
  >
    <div class="flex flex-col gap-6 w-full pt-6 md:pt-0">
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center gap-3">
          <WalletType />
          <span class="text-[15px]">
            {{ `${walletType?.charAt(0).toUpperCase()}${walletType?.slice(1)}` }}
          </span>
        </div>
        <div class="flex gap-[7px] relative">
          <button class="" @click="copyText">
            <CopyIcon />
          </button>
          <div class="min-w-[40px] h-[24px]">
            <span v-if="!copied" v-auto-animate class="text-[16px] font-semibold">
              Copy
            </span>
            <span
              v-if="copied"
              v-auto-animate
              class="text-[16px] absolute top-0 font-semibold"
            >
              Copied
            </span>
          </div>
        </div>
      </div>
      <div class="w-full flex items-center justify-between">
        <span class="text-[16px]">{{ walletLabel }}</span>

        <div class="flex items-center gap-[7px]">
          <a
            :href="scannersLink.getAddress(web3.chainId, web3.wallet)"
            class="cursor-pointer"
            target="_blank"
          >
            <ViewIcon />
          </a>
          <span class="text-[16px] min-w-[40px] font-semibold">View</span>
        </div>
      </div>
      <div class="flex flex-col">
        <span class="w-full text-start mt-[16px] text-[11px] text-label-text">
          Your network is:
        </span>
        <div
          v-if="REAL_CHAIN_IDS.includes(web3.realChainId?.toString() as ChainId)"
          class="flex items-center gap-[12px] mt-[8px]"
        >
          <div class="w-full">
            <div
              class="flex items-center mr-1 bg-primary-bg border border-primary-border rounded-[8px] h-[48px] w-full px-4"
            >
              <component
                :is="
                  chainsLabels.filter((o) => o.value === web3.chainId)[0]?.component ??
                  chainsLabels[0].component
                "
                class="mr-3"
              />
              <span class="text-[#D9D9D9] text-[13px]">
                {{
                  chainsLabels.filter((o) => o.value === web3.chainId)[0]?.label ??
                  chainsLabels[0].label
                }}
              </span>
            </div>
          </div>
        </div>
        <div
          v-else
          class="text-[#eb5757] border border-[#eb5757] p-[16px] bg-[#eb57571a] rounded-lg h-[48px] w-[320px] flex items-center gap-[12px]"
        >
          <WrongNetworkIcon />
          <div class="text-start text-[13px]">An unsupported network is selected</div>
        </div>
      </div>

      <div class="w-full mt-[8px]">
        <div
          v-for="chain of normalizedChainsLabels"
          :key="chain.value"
          class="flex justify-between gap-2 items-end"
        >
          <div class="text-[15px] text-[#D9D9D9]">
            {{ chain.label }}
          </div>
          <div
            v-if="balanceToken(chain.value as ChainId).length <= 8"
            class="text-[16px] break-words"
          >
            <!-- {{ Number(balanceTokenNumber(chain.value)).toFixed(2) }} -->
            {{ balanceTokenNumber(chain.value as ChainId).toFixed(2) }}
            {{ token.symbol }}
          </div>
          <div v-else class="text-[16px] break-words">
            {{ formatBigNums(balanceToken(chain.value as ChainId), token.symbol) }}
            {{ token.symbol }}
          </div>
        </div>
      </div>
    </div>
    <div class="w-full">
      <UserButton class="block md:hidden mt-[36px]" />
      <div
        @click="onDisconnect"
        class="flex md:hidden items-center mt-[24px] w-full justify-center gap-4"
      >
        <span class="text-base">Exit</span>
        <LogoutIcon />
      </div>
      <div class="w-full hidden md:block">
        <GButton
          primary
          @click="onDisconnect"
          class="mt-[32px] mb-[0] text-[15px] w-full"
        >
          Disconnect
        </GButton>
      </div>
    </div>
    <!-- <UserButton class="block md:hidden mt-[36px]" />
    <div
      @click="onDisconnect"
      class="flex md:hidden items-center mt-[24px] w-full justify-center gap-4"
    >
      <span class="text-base">Exit</span>
      <LogoutIcon />
    </div>
    <div class="w-full hidden md:block">
      <GButton primary @click="onDisconnect" class="mt-[32px] mb-[0] text-[15px] w-full">
        Disconnect
      </GButton>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import WalletType from '@/components/base/WalletTypeIcons.vue'
import GButton from '@/components/gotbit-ui-kit/GButton.vue'
import { useMedia } from '@/composables'
import { scannersLink, useWallet, useWeb3 } from '@/gotbit-tools/vue'
import { ChainId } from '@/gotbit-tools/vue/types'
import { REAL_CHAIN_IDS, chainsLabels } from '@/misc/chains'
import { formatBigNums } from '@/misc/utils'
import { useTokenRead } from '@/store/business/token'
import { useClipboard } from '@vueuse/core'
import { computed, ref, unref } from 'vue'
import CopyIcon from '@/components/gotbit-ui-kit/icons/CopyIcon.vue'
import ViewIcon from '@/components/gotbit-ui-kit/icons/ViewIcon.vue'
import WrongNetworkIcon from '@/components/gotbit-ui-kit/icons/WrongNetworkIcon.vue'
import { useToken } from '@/store/contracts/token'
import UserButton from '@/components/base/UserButton.vue'
import LogoutIcon from '@/components/gotbit-ui-kit/icons/LogoutIcon.vue'
import { useBridgeRead } from '@/store/business/bridge'

interface DropdownProps {
  visible: boolean
}
const props = defineProps<DropdownProps>()
const emit = defineEmits(['disconnect'])

const { walletType } = useWeb3()
const { walletLabel, disconnect } = useWallet()
const { balanceTokenNumber, balanceToken } = useTokenRead()
const token = useToken()
const { supportedChains } = useBridgeRead()

const normalizedChainsLabels = computed(() =>
  chainsLabels
    .filter((item) => unref(supportedChains).includes(item.value))
    .map((chain) => ({
      value: chain.value,
      label: chain.label,
    }))
)

const onDisconnect = async () => {
  emit('disconnect')
  await disconnect()
}

const web3 = useWeb3()
const clipboard = useClipboard()
const { sm } = useMedia()

const copied = ref(false)
const copyHover = ref(false)

const copyText = async () => {
  copyHover.value = true
  await clipboard.copy(web3.wallet)
  copied.value = true
  copyHover.value = false
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<style scoped lang="scss"></style>
