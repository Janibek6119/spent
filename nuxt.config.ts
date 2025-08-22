import Aura from "@primeuix/themes/aura";
import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@primevue/nuxt-module"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  vite: { plugins: [tailwindcss()] },
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
});
