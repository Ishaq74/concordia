import type { APIRoute } from 'astro';
import { sentEmails, clearSentEmails } from '@lib/smtp/store';


// This endpoint is only active when running in a test environment. It
// exposes the contents of the in-memory SMTP store so that Playwright tests
// can inspect links contained in verification/reset emails without touching
// a real SMTP provider.

export const get: APIRoute = async () => {
  if (process.env.NODE_ENV !== 'test') {
    return new Response(JSON.stringify({ error: 'not_available' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ emails: sentEmails }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// provide a way to clear from the browser if needed
export const post: APIRoute = async ({ request }) => {
  if (process.env.NODE_ENV !== 'test') {
    return new Response(null, { status: 404 });
  }
  const { action } = await request.json();
  if (action === 'clear') {
    clearSentEmails();
  }
  return new Response(null, { status: 204 });
};
