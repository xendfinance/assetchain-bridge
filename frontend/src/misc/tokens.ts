import EthereumIcon from '@/components/base/icons/EthereumIcon.vue';
import RwaIcon from '@/components/base/icons/RwaIcon.vue'
import PmlgIcon from '@/components/base/icons/PmlgIcon.vue'
import UprIcon from '@/components/base/icons/UprIcon.vue'
import CosmosIcon from '@/components/base/icons/CosmosIcon.vue'
import UsdtIcon from '@/components/base/icons/UsdtIcon.vue'
import UsdcIcon from '@/components/base/icons/UsdcIcon.vue'
import WethIcon from '@/components/base/icons/WethIcon.vue'
import WntIcon from '@/components/base/icons/WntIcon.vue'
import BitcoinIcon from '@/components/base/icons/BItcoinIcon.vue'


export const tokensLabels: {
  label: string
  value: string,
  component: any
}[] = [
    {
      label: 'RWA',
      value: 'RWA',
      component: RwaIcon,
    },
    {
      label: 'ETH',
      value: 'ETH',
      component: EthereumIcon,
    },
    {
      label: 'USDT',
      value: 'USDT',
      component: UsdtIcon,
    },
    {
      label: 'USDC',
      value: 'USDC',
      component: UsdcIcon,
    },
    {
      label: 'PMLG',
      value: 'PMLG',
      component: PmlgIcon,
    },
    {
      label: 'UPR',
      value: 'UPR',
      component: UprIcon,
    },
    {
      label: 'Cosmos',
      value: 'Cosmos',
      component: CosmosIcon,
    },
    {
      label: 'USDC',
      value: 'USDC',
      component: UsdcIcon,
    },
    {
      label: 'WETH',
      value: 'WETH',
      component: WethIcon,
    },
    {
      label: 'WNT',
      value: 'WNT',
      component: WntIcon,
    },
    {
      label: 'aUSDC.e',
      value: 'aUSDC.e',
      component: UsdcIcon,
    },
    {
      label: 'WBTC',
      value: 'WBTC',
      component: BitcoinIcon,
    },
  ]
