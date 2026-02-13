import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";

export const post: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email : "";
    const callbackURL = typeof body.callbackURL === "string" ? body.callbackURL : undefined;

    if (!email) {
      return new Response(JSON.stringify({ error: "missing_email" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const auth = await getAuth();
    // Try known API shapes — many adapters expose a reset/request endpoint
    if (auth && (auth as any).api) {
      const api = (auth as any).api;
      if (typeof api.sendResetPasswordEmail === "function") {
        await api.sendResetPasswordEmail({ body: { email, callbackURL } });
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (typeof api.requestPasswordReset === "function") {
        await api.requestPasswordReset({ body: { email, callbackURL } });
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ error: "not_implemented", message: "Server-side forgot-password flow not wired to Better-Auth API." }), { status: 501, headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "server_error", message: String(err) }), { status: 500, headers: { "content-type": "application/json" } });
  }
};
