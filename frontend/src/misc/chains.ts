import type { ChainId } from '@/gotbit-tools/vue/types'
import { IS_DEBUG } from '@/gotbit.config'

import BinanceIcon from '@/components/base/icons/BinanceIcon.vue'
import ArbitumIcon from '@/components/base/icons/ArbitumIcon.vue'
import XendIcon from '@/components/base/icons/XendIcon.vue'

import EthereumIcon from '@/components/base/icons/EthereumIcon.vue'
import AvaxIconVue from '@/components/base/icons/AvaxIcon.vue'
import PolygonIcon from '@/components/base/icons/PolygonIcon.vue'
import PulseChainIcon from '@/components/base/icons/IconPulseChain.vue'
import PulseIconVue from '@/components/base/icons/PulseIconVue.vue'
import BaseIconVue from '@/components/base/icons/BaseIconVue.vue'

export const REAL_CHAIN_IDS: ChainId[] = IS_DEBUG
  ? ['97', '421614', '42421', '11155111', '80002', '84532']
  : ['97', '421614', '42421']

export const chainsLabels: { value: ChainId; label: string; component: any }[] = IS_DEBUG
  ? [
      // { value: '56', label: 'BSC', component: BinanceIcon },
      // { value: '1', label: 'Ethereum', component: EthereumIcon },
      // { value: '137', label: 'Polygon', component: PolygonIcon },
      // { value: '942', label: 'PulseChain', component: [IconPulseChain] }
      // { value: '42161', label: 'Arbitrum', component: ArbitumIcon },
      // { value: '369', label: 'PulseChain', component: PulseIconVue },
      // { value: '8453', label: 'Base', component: BaseIconVue },
      { value: '421614', label: 'Arbitrum', component: ArbitumIcon },
      { value: '42421', label: 'Xend', component: XendIcon },
      { value: '97', label: 'BSC', component: BinanceIcon },
    ]
  : [
      // { value: '97', label: 'BSC', component: BinanceIcon },
      // { value: '43113', label: 'Avalanche', component: AvaxIconVue },
      // { value: '80001', label: 'Polygon', component: PolygonIcon },

      { value: '421614', label: 'Arbitrum', component: ArbitumIcon },
      { value: '42421', label: 'Xend', component: XendIcon },
      { value: '97', label: 'BSC', component: BinanceIcon },
    ]
