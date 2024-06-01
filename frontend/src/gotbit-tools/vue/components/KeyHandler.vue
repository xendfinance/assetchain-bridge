<template></template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { debugOn } from '../utils/dev'

const router = useRouter()

var map: Record<string, boolean> = {}

function keyComb(keys: string) {
  for (let i = 0; i < keys.length; i++) if (!map[keys[i]]) return false

  map = {}
  return true
}

onkeydown = onkeyup = function (e) {
  try {
    map[e.key] = e.type === 'keydown'
  } catch {}

  if (keyComb('cnt;')) router.push('/contracts-info')
  else if (keyComb('db;')) debugOn()
}
</script>
