import { createApp } from 'vue'
import { ref, computed } from 'vue'

// Provide Vue globals for composables testing
;(globalThis as any).ref = ref
;(globalThis as any).computed = computed

// Setup dummy app
const app = createApp({
  template: '<div></div>'
})
app.mount(document.createElement('div'))