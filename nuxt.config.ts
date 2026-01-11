// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-07-15',
  ssr: false, // Client-side only rendering for GitHub Pages
  devtools: { enabled: true },

  // Google Fonts for handwritten aesthetic
  app: {
    baseURL: '/timekeeper/',
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Patrick+Hand&family=Courier+Prime:wght@400;700&display=swap'
        }
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
      ]
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  // Import global CSS
  css: [
    '~/assets/css/notebook.css'
  ],

  pinia: {
    storesDirs: ['./stores/**']
  }
})

