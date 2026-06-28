import type { MessageSchema } from "./i18n.config";

/**
 * See [Explanation](./EXPLANATION.md) for why we merge this.
 */
declare module "vue-i18n" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}
}

export {};
