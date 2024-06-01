<template>
  <vue-awesome-paginate
    :total-items="props.totalItems"
    :items-per-page="props.itemsPerPage"
    :max-pages-shown="3"
    v-model="currentPage"
    @click="onClickHandler"
  >
    <template #prev-button>
      <svg
        width="18"
        height="19"
        viewBox="0 0 18 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.25 14L6.75 9.5L11.25 5"
          :stroke="currentPage === 1 ? '#FFFFFF90' : 'white'"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </template>
    <template #next-button>
      <svg
        width="18"
        height="19"
        viewBox="0 0 18 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.75 5L11.25 9.5L6.75 14"
          :stroke="currentPage === pages ? '#FFFFFF90' : 'white'"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </template>
  </vue-awesome-paginate>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface PaginationProps {
  pages: number
  itemsPerPage: number
  totalItems: number
}

const props = defineProps<PaginationProps>()

const currentPage = ref(1)

const onClickHandler = (page: number) => {
  console.log(page)
}
</script>

<style>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
.paginate-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 18px;
  padding: 1px 0 3px;
  color: #A3A8BB;
}

.paginate-buttons:hover {
  color: #FFFFFF;
}

.active-page {
  padding: 1px 8px 3px;
  /* padding-bottom: 3px; */

  font-weight: 500;
  color: #2042B8;
  border: 1px solid #2042B8;
  border-radius: 4px;
}
</style>
