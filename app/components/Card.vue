<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  shadow?: 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'md',
  rounded: 'lg',
  padding: 'md',
  hover: false
})

// Computed classes
const shadowClasses = computed(() => {
  const shadows = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  return shadows[props.shadow]
})

const roundedClasses = computed(() => {
  const rounded = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl'
  }
  return rounded[props.rounded]
})

const paddingClasses = computed(() => {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }
  return paddings[props.padding]
})
</script>

<template>
  <div
    :class="[
      'bg-white border border-gray-100',
      shadowClasses,
      roundedClasses,
      paddingClasses,
      {
        'hover:shadow-xl transition-shadow duration-300': hover
      }
    ]"
  >
    <div v-if="title || subtitle" class="mb-4">
      <h3 v-if="title" class="text-xl font-semibold text-gray-900 mb-1">
        {{ title }}
      </h3>
      <p v-if="subtitle" class="text-gray-600">
        {{ subtitle }}
      </p>
    </div>

    <slot></slot>
  </div>
</template>