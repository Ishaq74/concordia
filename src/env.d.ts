/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    // `better-auth`'s User type plus common role fields used in the app
    // User returned from better-auth may have nullable role
    user: (import('better-auth').User & { role?: string | null; roles?: string[] }) | null;
    // Session inferred from better-auth; can be extended with customSession plugin
    session: import('better-auth').Session | null;
    // Active organization ID extracted from session for org-scoping
    organizationId?: string | null;
  }
}