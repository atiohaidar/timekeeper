export const useTimer = () => {
    const seconds = ref(0)
    const isActive = ref(false)
    let timer: any = null

    const start = () => {
        if (isActive.value) return
        isActive.value = true
        timer = setInterval(() => {
            seconds.value++
        }, 1000)
    }

    const pause = () => {
        isActive.value = false
        clearInterval(timer)
    }

    const reset = () => {
        pause()
        seconds.value = 0
    }

    // Penting: Kembalikan data yang ingin dipakai di komponen
    return {
        seconds,
        isActive,
        start,
        pause,
        reset
    }
}
