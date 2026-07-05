// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n'],
  srcDir: 'src/',
  i18n: {
    defaultLocale: 'es-ES',
    langDir: 'locales/',
    lazy: true,
    strategy: 'no_prefix',
    locales: [
      {
        code: 'es-ES',
        language: 'es-ES',
        file: 'es-ES.json'
      }
    ]
  },
  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'CheapTrips',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || ''
    }
  }
})
