import { computed, onMounted, onUnmounted, ref, unref } from 'vue'
import { useIntervalFn, useWindowSize } from '@vueuse/core'
import { getProvider, useWeb3 } from '@/gotbit-tools/vue'
import { ChainId } from '@/gotbit-tools/vue/types'
import { genPerChainId } from '@/misc/utils'

export type Size = 'xl' | 'lg' | 'md' | 'sm' | 'xs'

// export const useInterval = (callback: () => any, ms: number) => {
//   const intervalId = ref<NodeJS.Timer | null>(null)
//   onMounted(() => {
//     intervalId.value = setInterval(callback, ms)
//   })
//   onUnmounted(() => {
//     if (intervalId.value) clearInterval(intervalId.value)
//   })
// }

export const useMedia = (breakpoints?: { sm?: number; md?: number; lg?: number }) => {
  const smD = breakpoints?.sm ?? 640
  const mdD = breakpoints?.md ?? 768
  const lgD = breakpoints?.lg ?? 1024

  const { width } = useWindowSize()

  return {
    sm: computed(() => width.value < smD),
    md: computed(() => smD < width.value && width.value < mdD),
    lg: computed(() => mdD < width.value && width.value < lgD),
    xl: computed(() => lgD < width.value),
    currentSize: computed(() => {
      if (width.value < smD) return 'sm'
      if (smD < width.value && width.value < mdD) return 'md'
      if (mdD < width.value && width.value < lgD) return 'lg'
      if (lgD < width.value) return 'lg'
      return 'xl'
    }),
  }
}

export const useBreakpoint = (breakpoint: number) => {
  const { width } = useWindowSize()

  return width.value < breakpoint
}

export const useInterval = (callback: () => any, ms: number) => {
  const intervalId = ref<NodeJS.Timer | null>(null)
  onMounted(() => {
    intervalId.value = setInterval(callback, ms)
  })
  onUnmounted(() => {
    if (intervalId.value) clearInterval(unref(intervalId)?.[Symbol?.toPrimitive]?.())
  })
}

const currentBlock = ref(genPerChainId(() => 0))


export const getCurrentBlock = async () => {
  const web3 = useWeb3()
  // let currentBlocks = genPerChainId(() => 0)
  console.log('web3.chainIds__1', currentBlocks.value);
  for (const chainId of web3.chainIds) {
    const provider = getProvider(chainId)
    const res = await provider.getBlockNumber()
    currentBlock.value[chainId] = res
    console.log('web3.chainIds', chainId, res);

  }
  console.log('web3.chainIds__2', currentBlocks);

  return currentBlocks
}

// const { pause, resume, isActive } = useIntervalFn(async () => {
//   currentBlock.value = await getCurrentBlock()
// }, 2000)

export const currentBlocks = computed(() => currentBlock.value)
