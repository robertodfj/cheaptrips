// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'src/',
  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'CheapTrips',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || ''
    }
  }
})
