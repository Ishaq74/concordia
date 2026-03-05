// simple in‑memory store shared between tests and the running server (when
// NODE_ENV=test).  When the SMTP mock is active, `sendMail` pushes entries
// into this array.  The E2E mailbox page reads from it.

export interface StoredEmail {
  messageId: string;
  to: string;
  subject: string;
  from?: string;
  text?: string;
  html?: string;
  [key: string]: any;
}

export const sentEmails: StoredEmail[] = [];

export function clearSentEmails() {
  sentEmails.length = 0;
}
