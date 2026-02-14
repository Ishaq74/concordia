import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import {
  registerSSEClient,
  removeSSEClient,
} from "@lib/notifications/notifications";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      controller.enqueue(encoder.encode(": connected\n\n"));

      registerSSEClient(userId, controller);

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(keepAlive);
          removeSSEClient(userId, controller);
        }
      }, 30_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        removeSSEClient(userId, controller);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
