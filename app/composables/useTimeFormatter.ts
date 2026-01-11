export const useTimeFormatter = () => {
    function formatTime(date: Date | string | null | undefined): string {
        if (!date) return '--:--'
        const d = typeof date === 'string' ? new Date(date) : date
        // Validasi date object
        if (isNaN(d.getTime())) return '--:--'

        return d.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    function formatDate(date: Date | string | null | undefined): string {
        if (!date) return '-'
        const d = typeof date === 'string' ? new Date(date) : date
        if (isNaN(d.getTime())) return '-'

        return d.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    function formatDuration(minutes: number): string {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        if (h > 0) return `${h}j ${m}m`
        return `${m}m`
    }

    return {
        formatTime,
        formatDate,
        formatDuration
    }
}
