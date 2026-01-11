<script setup lang="ts">
// Demo data
const features = [
  { name: 'Responsive Design', icon: '📱', desc: 'Mobile-first approach' },
  { name: 'Utility Classes', icon: '🛠️', desc: 'Rapid prototyping' },
  { name: 'Dark Mode Ready', icon: '🌙', desc: 'Built-in dark mode support' },
  { name: 'Performance', icon: '⚡', desc: 'Optimized CSS output' }
]

const colors = [
  'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500',
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-500'
]

const spacing = ['p-2', 'p-4', 'p-6', 'p-8', 'p-10', 'p-12']
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <h1 class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          🎨 Tailwind CSS Demo
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Eksplorasi berbagai fitur dan komponen Tailwind CSS di Nuxt.js
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Card
          v-for="feature in features"
          :key="feature.name"
          :title="feature.name"
          :subtitle="feature.desc"
          hover
          class="text-center"
        >
          <div class="text-4xl mb-4">{{ feature.icon }}</div>
        </Card>
      </div>

      <!-- Color Palette -->
      <Card title="🎨 Color Palette" subtitle="Utility classes untuk warna" class="mb-16">
        <div class="grid grid-cols-4 md:grid-cols-8 gap-4">
          <div
            v-for="color in colors"
            :key="color"
            :class="[
              color,
              'h-16 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-md hover:scale-105 transition-transform duration-200'
            ]"
          >
            {{ color.replace('bg-', '') }}
          </div>
        </div>
      </Card>

      <!-- Spacing Demo -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <Card title="📏 Spacing System" subtitle="Padding & margin utilities">
          <div class="space-y-4">
            <div
              v-for="space in spacing"
              :key="space"
              :class="[
                space,
                'bg-blue-100 border-2 border-blue-200 rounded-lg text-center text-blue-800 font-mono text-sm'
              ]"
            >
              {{ space }}
            </div>
          </div>
        </Card>

        <Card title="🔘 Button Variants" subtitle="Reusable button component">
          <div class="space-y-4">
            <div class="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Warning</Button>
            </div>

            <div class="flex flex-wrap gap-3">
              <Button size="sm" variant="secondary">Small</Button>
              <Button size="md" variant="secondary">Medium</Button>
              <Button size="lg" variant="secondary">Large</Button>
            </div>

            <div class="flex gap-3">
              <Button :loading="true" variant="primary">Loading</Button>
              <Button disabled variant="primary">Disabled</Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Typography -->
      <Card title="📝 Typography" subtitle="Text styling utilities" class="mb-16">
        <div class="space-y-6">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Heading Styles</h2>
            <p class="text-gray-600 mb-4">Various heading sizes with Tailwind</p>

            <div class="space-y-2">
              <h1 class="text-4xl font-bold text-gray-900">H1 - text-4xl</h1>
              <h2 class="text-3xl font-semibold text-gray-800">H2 - text-3xl</h2>
              <h3 class="text-2xl font-semibold text-gray-700">H3 - text-2xl</h3>
              <h4 class="text-xl font-medium text-gray-600">H4 - text-xl</h4>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold text-gray-800 mb-3">Text Colors & Weights</h3>
            <div class="space-y-2">
              <p class="text-gray-900 font-bold">Bold text - font-bold</p>
              <p class="text-gray-700 font-semibold">Semibold text - font-semibold</p>
              <p class="text-gray-600 font-medium">Medium text - font-medium</p>
              <p class="text-gray-500">Normal text - default</p>
              <p class="text-gray-400 font-light">Light text - font-light</p>
            </div>
          </div>
        </div>
      </Card>

      <!-- Layout Demo -->
      <Card title="📐 Layout System" subtitle="Flexbox & Grid utilities" class="mb-16">
        <div class="space-y-8">
          <!-- Flexbox Demo -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Flexbox Layout</h3>
            <div class="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="bg-blue-500 text-white p-4 rounded">Item 1</div>
              <div class="bg-green-500 text-white p-4 rounded">Item 2</div>
              <div class="bg-purple-500 text-white p-4 rounded">Item 3</div>
            </div>
          </div>

          <!-- Grid Demo -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">CSS Grid Layout</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="bg-red-500 text-white p-4 rounded text-center">1</div>
              <div class="bg-yellow-500 text-white p-4 rounded text-center">2</div>
              <div class="bg-green-500 text-white p-4 rounded text-center">3</div>
              <div class="bg-blue-500 text-white p-4 rounded text-center">4</div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Navigation -->
      <div class="text-center">
        <NuxtLink
          to="/"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <span>🏠</span> Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>