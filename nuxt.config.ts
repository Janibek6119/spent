import Aura from "@primeuix/themes/aura";
import tailwindcss from "@tailwindcss/vite";
import { DEFAULT_LOCALE, LOCALES } from "./i18n/const";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@primevue/nuxt-module",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
    "pinia-plugin-persistedstate/nuxt",
  ],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  i18n: {
    vueI18n: "i18n.config.ts",
    strategy: "no_prefix",
    locales: Array.from(LOCALES),
    defaultLocale: DEFAULT_LOCALE,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
    },
    // DO NOT do this while having that vue-i18n patch:
    // experimental: { typedOptionsAndMessages: "default" },
    // See i18n/EXPLANATION.md
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@primevue/core/api", "date-fns", "dexie", "zod"],
    },
  },
  css: ["~~/app/assets/css/main.css"],
  nitro: {
    preset: "github_pages",
  },
  primevue: {
    components: {
      prefix: "P",
    },
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: ".dark",
          cssLayer: {
            name: "primevue",
            order: "LAYERS_PLACEHOLDER",
          },
        },
      },
    },
  },
  typescript: {
    typeCheck: true,
  },
  app: {
    head: {
      style: [
        {
          innerHTML: "@layer theme, base, primevue, components, utilities;",
          tagPriority: -10,
        },
      ],
    },
  },
});
