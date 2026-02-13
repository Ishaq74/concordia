export const prerender = false;

import { getAuth } from "@lib/auth/auth";
import type { APIRoute } from "astro";

export const ALL: APIRoute = async (ctx) => {
    const securityHeaders = {
        'content-security-policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none';",
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff',
        'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
        'referrer-policy': 'no-referrer',
        'content-type': 'application/json',
    };
    try {
        const auth = await getAuth();
        if (!auth || typeof auth.handler !== 'function') {
            return new Response(JSON.stringify({ message: 'Auth not available' }), { status: 500, headers: securityHeaders });
        }
        // Handler peut retourner une Response ou un objet
        const result = await auth.handler(ctx.request);
        if (result instanceof Response) {
            // Fusionner les headers de sécurité
            const headers = new Headers(result.headers);
            for (const [k, v] of Object.entries(securityHeaders)) {
                if (!headers.has(k)) headers.set(k, v);
            }
            return new Response(result.body, { status: result.status, headers });
        }
        return new Response(JSON.stringify(result), { status: 200, headers: securityHeaders });
    } catch (err) {
        // Mapping d’erreurs courantes Better Auth
        let status = 500;
        let message = 'Internal Server Error';
        if (err && typeof err === 'object') {
            const msg = (err instanceof Error ? err.message : (err as any).message || '');
            if (/rate.*limit|429|too many/i.test(msg)) status = 429;
            else if (/content[-_ ]?type/i.test(msg)) status = 415;
            else if (/method/i.test(msg) && /not allowed|invalid/i.test(msg)) status = 405;
            else if (/body.*too large|payload/i.test(msg)) status = 413;
            else if (/invalid.*token|unauth/i.test(msg)) status = 401;
            else if (/forbidden|csrf|origin/i.test(msg)) status = 403;
            else if (/not found|404/i.test(msg)) status = 404;
            else if (/bad request|invalid|400|validation|input|dangerous|NoSQL|command injection|password|weak password|sequential|repetition|keyboard|leet|context predictable|common password/i.test(msg)) status = 400;
            message = msg;
        }
        const isDev = process.env.NODE_ENV !== 'production';
        const body = { message: isDev && err instanceof Error ? (err.stack || err.message) : message };
        return new Response(JSON.stringify(body), { status, headers: securityHeaders });
    }
};
