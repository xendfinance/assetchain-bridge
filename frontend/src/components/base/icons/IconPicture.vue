<template>
    <div class="relative">
        <picture>
            <!-- <source :srcset="`${props.path}.webp`" type="image/webp" /> -->
            <img
                class="h-full w-full object-cover"
                :src="`${props.path}.png`"
                alt="Media picrute"
            />
        </picture>
    </div>
</template>

<script setup lang="ts">
interface IconProps {
    path: string
}
const props = defineProps<IconProps>()


// RwaIcon
// PmlgIcon
// UprIcon
// CosmosIcon
</script>