import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getWalletByUserId, getWalletTransactions } from "@lib/wallet/wallet";

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const w = await getWalletByUserId(session.user.id);

  if (!w) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const transactions = await getWalletTransactions(w.id, { limit, offset });

  return new Response(
    JSON.stringify({
      wallet: { id: w.id, balance: w.balance, currency: w.currency },
      transactions,
      limit,
      offset,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};
