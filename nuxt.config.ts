declare const process: {
  env: Record<string, string | undefined>
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n'],
  srcDir: 'src/',
  app: {
    head: {
      script: [
        {
          src: 'https://emrldtp.com/NTQ2NzU3.js?t=546757',
          async: true,
          'data-noptimize': '1',
          'data-cfasync': 'false',
          'data-wpfc-render': 'false',
          'data-seraph-accel-crit': '1',
          'data-no-defer': '1'
        }
      ]
    }
  },
  runtimeConfig: {
    skyscannerApiKey: process.env.SKYSCANNER_API_KEY || '',
    skyscannerApiBaseUrl: process.env.SKYSCANNER_API_BASE_URL || 'https://partners.api.skyscanner.net/apiservices/v3',
    skyscannerMarket: process.env.SKYSCANNER_MARKET || 'ES',
    skyscannerLocale: process.env.SKYSCANNER_LOCALE || 'es-ES',
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'CheapTrips',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || ''
    }
  },
  i18n: {
    defaultLocale: 'es-ES',
    langDir: 'locales/',
    strategy: 'no_prefix',
    locales: [
      {
        code: 'es-ES',
        language: 'es-ES',
        file: 'es-ES.json'
      }
    ]
  }
})
