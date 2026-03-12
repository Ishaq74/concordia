export const prerender = false;

import type { APIRoute } from "astro";

const handler: APIRoute = async (ctx) => {
    const { getAuth } = await import("@lib/auth/auth");
    const auth = await getAuth();
    return auth.handler(ctx.request);
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
