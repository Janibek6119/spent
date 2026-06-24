import Aura from "@primeuix/themes/aura";
import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@primevue/nuxt-module", "@pinia/nuxt", "@vueuse/nuxt", "pinia-plugin-persistedstate/nuxt"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@primevue/core/api"],
    },
  },
  css: ["~~/app/assets/css/main.css"],
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
            order: "theme, base, primevue", // not like in TW v3 ("tailwind-base, primevue, tailwind-utilities")
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
          innerHTML: "@layer theme, base, components, utilities;",
          tagPriority: -10,
        },
      ],
    },
  },
});
