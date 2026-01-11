export const useAppStatus = () => {
    // 1. useState: Ini GLOBAL. Nilainya sama di semua komponen.
    // Cocok untuk: User Profile, Theme, Global Settings.
    const globalAppTitle = useState('app-title', () => 'Timekeeper v1.0')

    // 2. ref: Ini LOKAL per panggilan.
    // Jika kamu panggil useAppStatus() di dua tempat, masing-masing punya 'localTime' sendiri.
    const localVisitTime = ref(new Date().toLocaleTimeString())

    // Kita bisa bungkus keduanya dalam satu Composable
    return {
        globalAppTitle,
        localVisitTime
    }
}
