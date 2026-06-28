The [vue-i18n patch](../patches/vue-i18n-patch.md) is to keep translation keys stricter so that the IDE would detect you a typo.

BUT it must generate types, and `@nuxtjs/i18n` does that only in dev mode:

```ts
async function prepareTypeGeneration({ resolver, options }, nuxt) {
  if (options.experimental.typedOptionsAndMessages === false || !nuxt.options.dev) {
    return;
  }
// ...
```

So instead of enabling the option to rely on the module for generation, [merge](./vue-i18n.d.ts) the `vue-i18n`'s `DefineLocaleMessage` type with the `MessageSchema` generated in [i18n.config.ts](./i18n.config.ts) file, and no generation is needed.
