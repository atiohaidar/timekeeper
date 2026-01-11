<!--
  InlineEdit.vue
  
  Inline editable field component (Notion-style).
  Click to edit, auto-save on blur or Enter.
  
  UX: Reduces friction in data entry, feels more natural
-->
<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number
  type?: 'text' | 'number' | 'textarea'
  placeholder?: string
  required?: boolean
  label?: string
  validation?: (value: string | number) => string | null // Returns error message or null
  maxLength?: number
  min?: number
  max?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  save: [value: string | number]
}>()

const isEditing = ref(false)
const localValue = ref(props.modelValue)
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)
const errorMessage = ref<string | null>(null)

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})

function startEdit() {
  isEditing.value = true
  localValue.value = props.modelValue
  errorMessage.value = null
  
  nextTick(() => {
    inputRef.value?.focus()
    if (inputRef.value && 'select' in inputRef.value) {
      inputRef.value.select()
    }
  })
}

function validate(): boolean {
  // Required validation
  if (props.required && !localValue.value) {
    errorMessage.value = 'Field ini wajib diisi'
    return false
  }

  // Custom validation
  if (props.validation) {
    const error = props.validation(localValue.value)
    if (error) {
      errorMessage.value = error
      return false
    }
  }

  // Number range validation
  if (props.type === 'number') {
    const numValue = Number(localValue.value)
    if (props.min !== undefined && numValue < props.min) {
      errorMessage.value = `Minimal ${props.min}`
      return false
    }
    if (props.max !== undefined && numValue > props.max) {
      errorMessage.value = `Maksimal ${props.max}`
      return false
    }
  }

  errorMessage.value = null
  return true
}

function save() {
  if (!validate()) {
    return
  }

  isEditing.value = false
  
  // Only emit if value changed
  if (localValue.value !== props.modelValue) {
    emit('update:modelValue', localValue.value)
    emit('save', localValue.value)
  }
}

function cancel() {
  isEditing.value = false
  localValue.value = props.modelValue
  errorMessage.value = null
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && props.type !== 'textarea') {
    e.preventDefault()
    save()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    cancel()
  }
}
</script>

<template>
  <div class="inline-edit-wrapper">
    <!-- Label (if provided) -->
    <label v-if="label" class="font-handwritten text-xs text-notebook-ink-light mb-1 block">
      {{ label }}
      <span v-if="required" class="text-pen-red">*</span>
    </label>

    <!-- Display Mode -->
    <div
      v-if="!isEditing"
      class="inline-edit-display group cursor-pointer hover:bg-yellow-50/30 transition-colors rounded px-2 py-1 -mx-2 -my-1"
      @click="startEdit"
      :title="'Klik untuk edit'"
    >
      <span 
        :class="[
          'font-handwritten text-lg',
          !modelValue && 'text-notebook-ink-light italic'
        ]"
      >
        {{ modelValue || placeholder || 'Klik untuk edit...' }}
      </span>
      <span class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
        ✏️
      </span>
    </div>

    <!-- Edit Mode -->
    <div v-else class="inline-edit-input">
      <textarea
        v-if="type === 'textarea'"
        ref="inputRef"
        v-model="localValue"
        :placeholder="placeholder"
        :maxlength="maxLength"
        class="w-full px-3 py-2 border-2 border-notebook-ink rounded font-handwritten text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        :class="errorMessage && 'border-pen-red'"
        @blur="save"
        @keydown="handleKeydown"
        rows="3"
      />
      <input
        v-else
        ref="inputRef"
        v-model="localValue"
        :type="type || 'text'"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :min="min"
        :max="max"
        class="w-full px-3 py-2 border-2 border-notebook-ink rounded font-handwritten text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        :class="errorMessage && 'border-pen-red'"
        @blur="save"
        @keydown="handleKeydown"
      />

      <!-- Error Message -->
      <p v-if="errorMessage" class="text-pen-red text-xs font-handwritten mt-1">
        {{ errorMessage }}
      </p>

      <!-- Hint -->
      <p class="text-notebook-ink-light text-xs font-handwritten mt-1">
        Enter untuk simpan, Esc untuk batal
      </p>
    </div>
  </div>
</template>

<style scoped>
.inline-edit-wrapper {
  position: relative;
}

.inline-edit-display {
  min-height: 2rem;
  display: inline-flex;
  align-items: center;
}
</style>
