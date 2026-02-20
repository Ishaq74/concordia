/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    // `better-auth`'s User type plus common role fields used in the app
    user: (import('better-auth').User & { role?: string; roles?: string[] }) | null;
    // Session inferred from better-auth; can be extended with customSession plugin
    session: import('better-auth').Session | null;
  }
}