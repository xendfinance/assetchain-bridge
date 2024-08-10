<template>
  <BaseCard
    class="history-card p-[44px] flex flex-col"
    :class="{ 'min-h-fit': bridge.emptyHistory }"
    v-auto-animate
  >
    <div v-if="login" class="flex flex-col flex-grow" v-auto-animate>
      <div class="font-medium text-[20px] uppercase" ref="history">
        Your transaction history
      </div>
      <div v-if="!bridge.emptyHistory" class="mt-[20px] md:mt-[40px]">
        <div class="flex mb-[36px] md:mb-[39px] items-center">
          <div class="flex w-[230px]">
            <input
              type="checkbox"
              id="checkbox-unclaim"
              v-model="onlyUnclamed"
              class="checkbox-unclaim"
              @click="onOnlyUnclamed"
            />
            <label for="checkbox-unclaim" class="lebel-checkbox-unclaim">
              <CheckboxMark v-if="onlyUnclamed" />
            </label>
            <div
              class="cursor-pointer hover:text-primary-btn duration-300"
              :class="onlyUnclamed ? 'text-primary-btn' : 'text-label-text'"
              @click="onOnlyUnclamed"
            >
              Show only unclaimed
            </div>
          </div>

          <div class="flex w-[150px]">
            <div
              class="cursor-pointer hidden lg:block hover:text-primary-btn duration-300"
              :class="asc ? 'text-label-text' : 'text-primary-btn'"
              @click="asc = !asc"
            >
              Sort by: Date
            </div>
            <button
              class="hidden md:block h-full w-[25px] cursor-pointer ml-[5px]"
              @click="asc = !asc"
            >
              <Switch
                v-if="!asc"
                class="hidden md:block"
                name="switch"
                stroke="#2042B8"
              />
              <SwitchHover
                v-else
                class="hidden md:block"
                name="switch"
                stroke="#A3A8BB"
              />
            </button>
          </div>

          <div class="w-[100px] hidden lg:inline-block text-label-text text-center">
            Amount
          </div>
          <div class="w-[115px] ml-[35px] text-label-text hidden md:block">Blocks</div>
        </div>

        <div
          v-if="sortedHistory.length && !bridge.loadingHistory"
          class="flex mt-[24px] flex-col gap-[20px] md:gap-[17px] w-full lg:pb-[60px]"
          v-auto-animate
        >
          <ElementHistory
            v-for="history in historyLength"
            v-bind="sortedItem(history).transactionCard"
            @claim="(cla) => itemFulfill(sortedItem(history), cla)"
            :key="
              sortedItem(history).fulfillTransaction.nonce +
              sortedItem(history).transactionCard.from +
              sortedItem(history).transactionCard.to
            "
            class="element"
          />
        </div>

        <!-- <div
          v-if="sortedHistory.length"
          class="md:hidden mt-[24px] flex flex-col gap-[18px] md:gap-[24px]"
          v-auto-animate
        >
          <ElementHistory
            v-for="history of sortedHistory"
            v-bind="history.transactionCard"
            @claim="itemFulfill(history)"
            :key="
              history.fulfillTransaction.nonce +
              history.transactionCard.from +
              history.transactionCard.to
            "
            class="element"
          />
        </div> -->
      </div>
      <div
        v-else-if="bridge.emptyHistory && !bridge.loadingHistory"
        class="md:text-left text-left text-[16px] mt-[12px] text-label-text"
      >
        You haven't made any transactions.
      </div>
      <div
        v-if="bridge.loadingHistory"
        class="w-full flex items-center justify-center flex-grow h-[100%]"
      >
        <BaseLoader />
      </div>
    </div>
    <div v-else class="p-[32px]">
      <div class="flex flex-col items-center text-center space-y-[32px]">
        <h3 class="font-semibold text-[20px]">Your transaction history</h3>
        <div class="">
          To see the history of your transactions and claim transfered tokens (if you
          haven’t claimed them) you need to connect to your wallet
          (MetaMask/WalletConnect/Coinbase).
        </div>
        <GButton
          primary
          @click="ui.openDialog('connectDialog', {})"
          class="w-[196px] h-[50px]"
        >
          {{ walletLabel }}
        </GButton>
      </div>
    </div>
    <div
      v-if="pages > 1"
      class="absolute bottom-[0px] right-[44px] w-[100%] flex justify-end h-[100px] items-center"
    >
      <div class="">
        <div v-if="bridge.loadingHistory">
          <SvgoThreeDots class="w-8 mx-[auto]" />
        </div>
        <Pagination
          v-if="
            !bridge.loadingHistory && sortByDate(asc, onlyUnclamed).length > ITEM_PER_PAGE
          "
          v-model="page"
          :total-items="sortByDate(asc, onlyUnclamed).length"
          :items-per-page="ITEM_PER_PAGE"
          :pages="pages"
        />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import Pagination from '@/components/base/Pagination.vue'
import SvgoThreeDots from '@/components/base/ThreeDots.vue'
import Switch from '@/components/base/icons/Switch.vue'
import SwitchHover from '@/components/base/icons/SwitchHover.vue'
import GButton from '@/components/gotbit-ui-kit/GButton.vue'
import BaseCard from '@/components/gotbit-ui-kit/GCard.vue'
import BaseLoader from '@/components/gotbit-ui-kit/GLoader.vue'
import CheckboxMark from '@/components/gotbit-ui-kit/icons/CheckboxMark.vue'
import ElementHistory from '@/components/history/Element.vue'
import { useWallet } from '@/gotbit-tools/vue'
import { useBridgeWrite } from '@/store/business/bridge'
import { useBridge } from '@/store/contracts/bridge'
import { useUIBridge } from '@/store/ui/bridge'
import { useDialogs } from '@/store/ui/dialogs'
import { computed, onMounted, ref, watch } from 'vue'

import { getCurrentBlock, useLatestChainBlockUpdate } from '@/composables'
import type { ChainId } from '@/gotbit-tools/vue/types'
import { useTokenRead } from '@/store/business/token'

export interface HistoryCardProps {
  tokenSymbol: string
}

const props = defineProps<HistoryCardProps>()
const symbol = computed(() => props.tokenSymbol)

const { login, walletLabel } = useWallet()
const ui = useDialogs()
const { fulfill, sortByDate } = useBridgeWrite()
const uiBridge = useUIBridge()
const bridge = useBridge()
const { addresses } = useTokenRead()

type History = ReturnType<typeof sortByDate>
const asc = ref(true)
const onlyUnclamed = ref(false)
const selectChain = ref<ChainId | 'all'>('all')
const page = ref(1)
const ITEM_PER_PAGE = 5

const sortedHistory = computed(() => {
  if (selectChain.value === 'all') return sortByDate(asc.value, onlyUnclamed.value)
  page.value = 1
  return sortByDate(asc.value, onlyUnclamed.value).filter(
    (o) => o.transaction.toChain === selectChain.value,
  )
})
const pages = computed(() => {
  return Math.ceil(sortedHistory.value.length / ITEM_PER_PAGE)
})

const historyLength = computed(() =>
  page.value === pages.value
    ? sortedHistory.value.length - (page.value - 1) * ITEM_PER_PAGE
    : ITEM_PER_PAGE,
)

console.log(sortByDate().map(d => console.log(d.transaction)), 'history')

const sortedItem = (idx: number) =>
  sortedHistory.value[(page.value - 1) * ITEM_PER_PAGE + idx - 1]

const history = ref<HTMLElement>()

const tokenAddress = (toChain: ChainId) => {
  return addresses(toChain).value.find((item) => item.label === symbol.value)?.value ?? ''
}

watch(symbol, () => {
  console.log('TOOOOOOOOken', symbol.value)
  page.value = 1
  bridge.upload()
})

const itemFulfill = async (
  { transaction, transactionCard, fulfillTransaction }: History[number],
  claimAmount: any,
) => {
  uiBridge.network = transaction.toChain

  const index = sortByDate(false)
    .filter((t) => t.transaction.fromChain === transaction.fromChain)
    .map((a) => a.transaction.nonce)
    .indexOf(transaction.nonce)

  // console.log(index, 'INDEX')
  // console.log(sortedHistory.value)
  // console.log(transaction, 'tx', transactionCard, 'txCard')
  await fulfill(fulfillTransaction, claimAmount?.claimAmount.value, index)

  if (
    onlyUnclamed.value &&
    sortByDate(asc.value, onlyUnclamed.value).length &&
    ITEM_PER_PAGE * page.value - sortByDate(asc.value, onlyUnclamed.value).length ===
      ITEM_PER_PAGE - 1
  ) {
    page.value > 1 ? page.value-- : (page.value = 1)
  }
}

const onOnlyUnclamed = () => {
  if (sortByDate(asc.value, onlyUnclamed.value).length) page.value = 1

  onlyUnclamed.value = !onlyUnclamed.value
}

// const { getTokens } = useToken()
// const web3 = useWeb3()
// const network = computed(() => web3.chainId)
// watch(network , () => {
//   getTokens()
// })

onMounted(async () => {
  await getCurrentBlock()
})
useLatestChainBlockUpdate()
// useInterval(async () => {
//   await getCurrentBlock()
// }, UPDATE_TIME)
</script>

<style lang="scss" scoped>
@import '@/components/gotbit-ui-kit/assets/config.scss';
@import '@/assets/config.scss';

.element {
  border-bottom: 1.5px solid #ffffff20;
  &:last-child {
    border-bottom: none;
  }
}
.history-card {
  position: relative;
  width: 100%;
  max-width: 820px;
  margin-top: 34px;
  @include for-size(lg) {
    padding: 40px;
  }
}
.checkbox-unclaim {
  display: none;
}

.lebel-checkbox-unclaim {
  width: 19px;
  height: 19px;
  border: 1px solid #a3a8bb;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
}

.checkbox-unclaim:checked + label {
  border: 1px solid #ffffff;
}
</style>
