export default defineEventHandler(async (event) => {
    // Simulasi data dari Database
    const stats = {
        uptime: '99.9%',
        usersActive: Math.floor(Math.random() * 100),
        serverTime: new Date().toLocaleTimeString(),
        version: '4.2.2'
    }

    return {
        status: 'success',
        data: stats
    }
})
