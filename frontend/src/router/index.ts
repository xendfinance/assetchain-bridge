import { createRouter, createWebHistory } from 'vue-router'
// import { contractsInfoPath } from '@/gotbit-tools/vue'

import Home from '@/views/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // contractsInfoPath,
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/bridge',
      name: 'bridge',
      component: Home,
    },
    {
      path: '/games',
      name: 'games',
      component: Home,
    },
    {
      path: '/library',
      name: 'library',
      component: Home,
    },
    {
      path: '/staking',
      name: 'staking',
      component: Home,
    },
  ],
})

export default router
