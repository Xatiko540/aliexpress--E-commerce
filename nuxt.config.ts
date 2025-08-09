export default defineNuxtConfig({
  pages: true,

  modules: [
    'nuxt-icon',
    'nuxt-lodash',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@nuxt-modules/compression',
    '@vite-pwa/nuxt',
    '@formkit/auto-animate',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap'
  ],

  plugins: [
    '~/plugins/piniaPersist.client.ts',
    '~/plugins/apexcharts.client.ts',
    // '~/plugins/vue-toastification.ts',
  ],

  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,json,ico,webmanifest}'],
    },
    manifest: {
      name: 'AliExpress',
      short_name: 'AliApp',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#FF4646',
      icons: [
        { src: '/AliExpress-logo.png', sizes: '192x192', type: 'image/png' },
        { src: '/AliExpress-logo.png', sizes: '512x512', type: 'image/png' },
      ]
    }
  },

// @ts-ignore: robots not in default config types
robots: [
  {
    userAgent: '*',
    disallow: '/admin',
    sitemap: 'https://aliwebb.xyz/sitemap.xml'
  }
],

  i18n: {
    locales: [
      { code: 'ru', file: 'ru.json' },
      { code: 'en', file: 'en.json' }
    ],
    lazy: true,
    langDir: 'locales/',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'supersecretkey123',
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    stripeSkKey: process.env.STRIPE_SK_KEY,
    public: {
      stripePk: process.env.STRIPE_PK_KEY || '',
    },
  },

  app: {
    head: {
      link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
      script: [{ src: 'https://js.stripe.com/v3/', defer: true }],
      meta: [{ name: 'referrer', content: 'no-referrer-when-downgrade' }],
    },
  },

  nitro: {
    compressPublicAssets: true,
    preset: 'node-server',
    routeRules: {
      '/**': { cors: true },
    },
    externals: {
      inline: ['jsonwebtoken']
    }
  }
})