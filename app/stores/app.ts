import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  // State: counter yang sebelumnya di useState
  const counter = ref(0)

  // Actions: fungsi untuk mengubah state
  const increment = () => counter.value++
  const decrement = () => counter.value--

  // Getters: computed values (opsional, tapi bagus untuk derived state)
  const isEven = computed(() => counter.value % 2 === 0)

  // Return semua yang ingin diexpose
  return {
    counter,
    increment,
    decrement,
    isEven
  }
})