import { ref } from 'vue'

export interface ToastMessage {
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
}

// Global state to share between useToast and ToastContainer
const toasts = ref<ToastMessage[]>([])

export function useToast() {
    const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
        const id = Math.random().toString(36).substring(2, 9)
        toasts.value.push({ id, message, type })
        // Auto-remove is also handled in Toast.vue, but we do it here as backup or to keep state clean
        // Actually Toast.vue has its own timer, but we need to remove it from the array too.
    }

    const removeToast = (id: string) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    return {
        toasts,
        addToast,
        removeToast,
        success: (msg: string) => addToast(msg, 'success'),
        error: (msg: string) => addToast(msg, 'error'),
        info: (msg: string) => addToast(msg, 'info'),
        warning: (msg: string) => addToast(msg, 'warning')
    }
}
