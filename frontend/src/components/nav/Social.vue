<template>
	<div class="container justify-between">
		<a 
			v-for="item in props.links" 
			:key="item.name" 
			:href="item.link" 
			target="_blank" 
			class="flex items-center justify-center md:gap-1"
		>
			<img :src="`/socials/${item.img}`" />
			<p class="hidden md:block capitalize text-[15px] ">
				{{ item.name }}
			</p>
		</a>
	</div>
</template>

<script setup lang="ts">

interface ISocialProps {
	links: {
		name: string
		link: string
		img: string
	}[]
}

const props = defineProps<ISocialProps>()
</script>

<style scoped lang="scss">
.container {
  display: grid;
  grid-template-columns: repeat(4, minmax(auto, 150px));
  gap: 16px;
  grid-auto-flow: row;
  @media only screen and (max-width: 576px) {
    display: flex;
  }
}
</style>