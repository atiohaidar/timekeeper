<script setup lang="ts">
// Kita buat Interface agar TypeScript tahu bentuk data dari API
interface ApiResponse {
  status: string
  data: {
    uptime: string
    usersActive: number
    serverTime: string
    version: string
  }
}

// Import store secara eksplisit
import { useAppStore } from '~/stores/app'

// Ganti useState dengan Pinia store
const appStore = useAppStore()

// Ambil data dari API internal kita
const { data: apiResponse, refresh } = await useFetch<ApiResponse>('/api/stats')

// Pakai timer dari composable (AUTO-IMPORTED!)
const { seconds, isActive, start, pause, reset } = useTimer()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          🚀 Timekeeper App
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Aplikasi modern dengan Nuxt 4, Vue 3, dan Tailwind CSS
        </p>
      </div>

      <!-- Timer Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <div class="text-center">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">⏱️ Timer</h2>
          <div class="text-6xl md:text-7xl font-bold text-indigo-600 mb-8 font-mono">
            {{ seconds }}
          </div>
          <div class="text-lg text-gray-600 mb-6">Detik</div>

          <div class="flex flex-wrap justify-center gap-4">
            <button
              v-if="!isActive"
              @click="start"
              class="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <span>▶️</span> Mulai
            </button>
            <button
              v-else
              @click="pause"
              class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <span>⏸️</span> Jeda
            </button>
            <button
              @click="reset"
              class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <span>⏹️</span> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 text-center">📊 Server Statistics</h3>

        <div v-if="apiResponse?.data" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard
            title="Uptime"
            :value="apiResponse.data.uptime"
            color="blue"
            icon="fas fa-server"
          />
          <StatusCard
            title="Active Users"
            :value="apiResponse.data.usersActive"
            color="green"
            icon="fas fa-users"
          />
          <StatusCard
            title="Server Time"
            :value="apiResponse.data.serverTime"
            color="yellow"
            icon="fas fa-clock"
          />
        </div>

        <div v-else-if="apiResponse === null" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p class="text-gray-600">⏳ Loading server data...</p>
        </div>

        <div v-else class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p class="text-red-700">⚠️ Server data format error</p>
        </div>

        <div class="text-center mt-6">
          <button
            @click="() => refresh()"
            class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
          >
            <span>🔄</span> Refresh Data
          </button>
        </div>
      </div>

      <!-- State Management Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <h3 class="text-2xl font-semibold text-gray-800 mb-6 text-center">🧩 Global State (Pinia)</h3>

        <div class="text-center mb-6">
          <div class="text-4xl font-bold text-orange-500 mb-2">{{ appStore.counter }}</div>
          <div class="text-lg">
            Status:
            <span :class="appStore.isEven ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
              {{ appStore.isEven ? 'Genap' : 'Ganjil' }}
            </span>
          </div>
        </div>

        <div class="flex justify-center gap-4 mb-4">
          <button
            @click="appStore.decrement"
            class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            ➖ Kurang
          </button>
          <button
            @click="appStore.increment"
            class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            ➕ Tambah
          </button>
        </div>

        <p class="text-sm text-gray-600 text-center">
          Coba ubah angka di atas, lalu pindah ke halaman "Tentang"
        </p>
      </div>

      <!-- Navigation -->
      <div class="text-center">
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <NuxtLink
            to="/about"
            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
          >
            <span>📖</span> Ke Halaman Tentang
          </NuxtLink>
          <NuxtLink
            to="/custom-page"
            class="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
          >
            <span>🎨</span> Halaman Custom Layout
          </NuxtLink>
        </div>
        <NuxtLink
          to="/tailwind-demo"
          class="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
        >
          <span>🎨</span> Tailwind CSS Demo
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
