<template>
  <footer class="w-full bg-primary-bg border-t-[1px] border-t-primary-border">
    <div
      class="w-full max-w-[1440px] flex items-center justify-center md:justify-between px-5 lg:px-20 mx-auto py-5 lg:py-8"
    >
      <a href="https://xend.finance" target="_blank" class="md:block w-[25%] hidden">
        <div class="flex flex-col items-start w-[135px]">
          <Logotip class="hidden md:block"/>
          <p class="text-[12px] mt-[10px] text-label-text uppercase">
            © {{ new Date().getFullYear() }} Xend Finance
          </p>
        </div>
      </a>
      <Social :links="links" class="" />
    </div>
    <!-- <div class="w-full flex justify-center items-center">
      <p class="max-w-[1280px] w-full flex justify-center md:justify-end items-center border-t-[1px] border-t-primary-border py-4 md:py-5 md:pt-[12px]">
        <span class="text text-[13px]">
          <a href="https://gotbit.io/">develop by Gotbit</a>
        </span>
      </p>
    </div> -->
  </footer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Logotip from '@/components/nav/Logo.vue'
import Social from '@/components/nav/Social.vue'

const links = ref([
  {
    name: 'medium',
    link: 'http://medium.com/xendfinance',
    img: 'medium.png',
  },
  {
    name: 'telegram',
    link: 'https://t.me/AssetChainBuilders',
    img: 'Telegram.svg',
  },
  {
    name: 'youtube',
    link: 'https://www.youtube.com/@AssetChain',
    img: 'Youtube.svg',
  },
  {
    name: 'linkedin',
    link: 'https://www.linkedin.com/company/theassetchain',
    img: 'Linkedin.svg',
  },
  {
    name: 'Testnet Leaderboard',
    link: 'https://leaderboard.assetchain.org',
    img: 'change.svg',
  },
  // {
  //   name: 'reddit',
  //   link: 'http://www.reddit.com/r/XendFinance/',
  //   img: 'Reddit.svg',
  // },
  {
    name: 'twitter',
    link: 'https://x.com/rwaassetchain',
    img: 'Twitter.svg',
  },
  {
    name: 'Github',
    link: ' https://github.com/xendfinance',
    img: 'Github.png',
  },
  {
    name: 'discord',
    link: 'https://discord.gg/Bd2RSPcy',
    img: 'Discord.svg',
  },
])
</script>

<style scoped lang="scss">
.text {
  color: rgba(239, 239, 229, 0.3);
}
</style>
