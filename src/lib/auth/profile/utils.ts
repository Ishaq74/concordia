// src/lib/profile/utils.ts
export type Status = {
  type: "success" | "error";
  message: string;
};

// Helpers
export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);

export const resolveErrorMessage = (error: unknown, translations?: Record<string, string>) => {
  if (typeof error === "string" && error.trim().length > 0) return error;
  if (error && typeof error === "object") {
    const body = (error as { body?: { error?: string; message?: string } })?.body;
    const code = body?.error ?? (error as { message?: string }).message;
    if (typeof code === "string" && code.trim().length > 0) return code;
    if (body?.message) return body.message;
  }
  return translations?.serverError ?? "Erreur inattendue.";
};

export const forwardSetCookies = (source: Response, response: Response) => {
  const headerProxy = source.headers as unknown as { getSetCookie?: () => string[] };
  const cookies = headerProxy.getSetCookie?.();
  if (Array.isArray(cookies)) {
    cookies.forEach((cookie) => response.headers.append("set-cookie", cookie));
    return;
  }
  for (const [key, value] of source.headers.entries()) {
    if (key.toLowerCase() === "set-cookie") response.headers.append("set-cookie", value);
  }
};