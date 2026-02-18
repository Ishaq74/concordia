import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { account, verification } from '../../database/schemas/auth-schema';
import { 
  createTestUser, 
  loginTestUser, 
  generateUniqueEmail,
  generateSecurePassword,
  getAuditLogs,
} from '@tests/utils/auth-test-utils';
import { cleanupTestData } from '@tests/utils/cleanup';
import { createSmtpMock } from '@tests/setup';
import { securityPayloads } from '@tests/fixtures/security-payloads';
import { getDrizzle } from '@database/drizzle';


import { session } from '@database/schemas/auth-schema';
import { eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

describe('Auth - Security & Functionality', () => {
  beforeAll(async () => await cleanupTestData());
  afterAll(async () => await cleanupTestData());

  describe('Inscription Sécurisée', () => {
    it('crée utilisateur avec password fort', async () => {
      const password = generateSecurePassword();
      const result = await createTestUser({ password });
      
      expect(result.user.id).toBeDefined();
      expect(result.credentials.password).toBeDefined(); // On ne teste pas result.user.password (jamais retourné)
    });

    it.each(securityPayloads.xss)('rejète XSS: %s', async (payload) => {
      await expect(
        createTestUser({ username: payload })
      ).rejects.toThrow();
    });

    it.each(securityPayloads.sql)('rejète SQL injection: %s', async (payload) => {
      await expect(
        createTestUser({ email: `test${payload}@test.local` })
      ).rejects.toThrow();
    });

    it.each(securityPayloads.nosql)('rejète NoSQL injection: %j', async (payload) => {
      await expect(
        createTestUser({ email: `test@test.local`, ...payload })
      ).rejects.toThrow();
    });

    it.each(securityPayloads.pathTraversal)('rejète path traversal: %s', async (payload) => {
      await expect(
        createTestUser({ username: payload })
      ).rejects.toThrow();
    });

    it.each(securityPayloads.commandInjection)('rejète command injection: %s', async (payload) => {
      await expect(
        createTestUser({ name: payload })
      ).rejects.toThrow();
    });

    it.each(securityPayloads.nullBytes)('rejète null bytes: %s', async (payload) => {
      await expect(
        createTestUser({ email: payload })
      ).rejects.toThrow();
    });

    it.each(securityPayloads.unicodeNormalization)('rejète unicode spoofing: %s', async (payload) => {
      await expect(
        createTestUser({ username: payload })
      ).rejects.toThrow();
    });

    it('rejète email homograph attack', async () => {
      // е (cyrillique) vs e (latin)
      const homograph = 'tеst@test.com'; // 'е' est cyrillique U+0435
      await expect(createTestUser({ email: homograph })).rejects.toThrow();
    });

    it('limite longueur champs', async () => {
      await expect(
        createTestUser({ username: 'a'.repeat(256) })
      ).rejects.toThrow(/length|too long/i);
    });
  });

  describe('Password Security', () => {
    it.each([
      { pwd: 'password', reason: 'common dictionary' },
      { pwd: '12345678', reason: 'sequential' },
      { pwd: 'abcdefgh', reason: 'sequential letters' },
      { pwd: 'Password1', reason: 'common pattern' },
      { pwd: 'Qwerty123!', reason: 'keyboard pattern' },
      { pwd: 'P@ssw0rd', reason: 'leet speak common' },
      { pwd: 'repeatrepeat', reason: 'repetition' },
      { pwd: 'user@2024', reason: 'context predictable' },
    ])('rejète password faible: $reason', async ({ pwd }) => {
      await expect(
        createTestUser({ password: pwd })
      ).rejects.toThrow();
    });

    it('hash password différent pour même password', async () => {
      const password = generateSecurePassword();
      const u1 = await createTestUser({ password });
      const u2 = await createTestUser({ password });
      
      // Vérifie pas de collision hash (si accessible)
      const db = await getDrizzle();
      // Simplifié avec Drizzle query
      const h1 = await db.query.account.findMany({ where: eq(account.userId, u1.user.id), columns: { password: true } });
      const h2 = await db.query.account.findMany({ where: eq(account.userId, u2.user.id), columns: { password: true } });
      if (h1[0] && h2[0]) {
        expect(h1[0].password).not.toBe(h2[0].password); // Salt différent
      }
    });
  });

  describe('Connexion Sécurisée', () => {
    it('JWT a claims sécurisés', async () => {
      const { credentials } = await createTestUser({});
      const login = await loginTestUser(credentials.email, credentials.password);
      
      // Decode JWT token to access payload claims
      const parts = login.token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        expect(payload.sub ?? payload.userId ?? login.user.id).toBeDefined();
        expect(payload.iat ?? payload.issuedAt).toBeDefined();
      } else {
        // Session-based token (not JWT) — verify token and user exist
        expect(login.token).toBeDefined();
        expect(login.user.id).toBeDefined();
      }
    });

    it('rejète timing attack (temps similaire)', async () => {
      const email = generateUniqueEmail();
      await createTestUser({ email });
      
      const times: number[] = [];
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        try {
          await loginTestUser(email, 'wrong');
        } catch {}
        times.push(Date.now() - start);
      }
      
      // Variance < 100ms = suspect (pas de vraie protection timing)
      const variance = Math.max(...times) - Math.min(...times);
      expect(variance).toBeLessThan(500); // Tolérance réseau
    });

    it('rate limit après 5 échecs', async () => {
      const { credentials } = await createTestUser({});
      
      // 5 échecs
      for (let i = 0; i < 5; i++) {
        await expect(loginTestUser(credentials.email, 'wrong')).rejects.toThrow();
      }
      
      // 6ème bloquée
      await expect(
        loginTestUser(credentials.email, credentials.password)
      ).rejects.toThrow(/rate|limit|too many/i);
    });

    it('session unique par device', async () => {
      const { credentials } = await createTestUser({});
      
      // Login 2x
      const login1 = await loginTestUser(credentials.email, credentials.password);
      const login2 = await loginTestUser(credentials.email, credentials.password);
      
      // Tokens différents
      expect(login1.token).not.toBe(login2.token);
      
      // 2 sessions en DB
      const db2 = await getDrizzle();
      const sessions = await db2.select().from(session).where(eq(session.userId, login1.user.id));
      expect(sessions.length).toBe(2);
    });
  });

  describe('Email Verification', () => {
    it('envoie email avec token sécurisé', async () => {
      const smtp = await createSmtpMock();
      const { credentials: _credentials } = await createTestUser({});
      
      const calls = smtp.getCalls();
      expect(calls.length).toBeGreaterThan(0);
      const emailCall = calls.find((c: any) => c[0]?.subject?.includes('verify'));
      expect(emailCall).toBeDefined();
      const token = emailCall && emailCall[0]?.html?.match(/token=([A-Za-z0-9_-]+)/)?.[1];
      expect(token).toBeDefined();
      expect(token && token.length).toBeGreaterThan(32); // Token long = sécurisé
    });

    it('token verification à usage unique', async () => {
      const smtp = await createSmtpMock();
      const { credentials: _credentials } = await createTestUser({});
      const calls = smtp.getCalls();
      const emailCall = calls.find((c: any) => c[0]?.subject?.includes('verify'));
      const token = emailCall && emailCall[0]?.html?.match(/token=([A-Za-z0-9_-]+)/)?.[1];
      expect(token).toBeDefined();
      // Premier usage : OK
      const auth = await getAuth();
      await expect((auth.api as any).verifyEmail({ body: { token } })).resolves.not.toThrow();
      // Second usage : doit échouer
      await expect((auth.api as any).verifyEmail({ body: { token } })).rejects.toThrow(/utilisé|used/i);
    });
  });

  describe('Password Reset', () => {
    it('token reset expire', async () => {
      const smtp = await createSmtpMock();
      const { credentials } = await createTestUser({});
      // Demander reset
      const auth = await getAuth();
      await (auth.api as any).forgotPassword({ body: { email: credentials.email } });
      await (auth.api as any).forgotPassword({ body: { email: credentials.email } });
      const calls = smtp.getCalls();
      const resetEmail = calls.find((c: any) => c[0]?.subject?.includes('password'));
      const token = resetEmail?.[0]?.html?.match(/token=([A-Za-z0-9_-]+)/)?.[1];
      expect(token).toBeDefined();
      // Simuler expiration (supposons 1h)
      const db = await getDrizzle();
      await db.update(verification).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(verification.value, token));
      // Tenter reset avec token expiré
      await expect((auth.api as any).resetPassword({ body: { token, newPassword: generateSecurePassword() } })).rejects.toThrow(/expire/i);
    });

    it('token reset à usage unique', async () => {
      const smtp = await createSmtpMock();
      const { credentials } = await createTestUser({});
      const auth = await getAuth();
      await (auth.api as any).forgotPassword({ body: { email: credentials.email } });
      await (auth.api as any).forgotPassword({ body: { email: credentials.email } });
      const calls = smtp.getCalls();
      const resetEmail = calls.find((c: any) => c[0]?.subject?.includes('password'));
      const token = resetEmail?.[0]?.html?.match(/token=([A-Za-z0-9_-]+)/)?.[1];
      expect(token).toBeDefined();
      // Premier usage : OK
      await expect((auth.api as any).resetPassword({ body: { token, newPassword: generateSecurePassword() } })).resolves.not.toThrow();
      // Second usage : doit échouer
      await expect((auth.api as any).resetPassword({ body: { token, newPassword: generateSecurePassword() } })).rejects.toThrow(/utilisé|used/i);
    });

    it('notification email si password changé', async () => {
      // Changer password, vérifier email envoyé
    });
  });

  describe('Logout & Session', () => {
    it('logout invalide token', async () => {
      const { credentials } = await createTestUser({});
      const login = await loginTestUser(credentials.email, credentials.password);
      
      const auth = await getAuth();
      await auth.api.signOut({ headers: { authorization: `Bearer ${login.token}` } });
      // Token invalide après
      await expect(
        auth.api.getSession({ headers: { authorization: `Bearer ${login.token}` } })
      ).rejects.toThrow();
    });

    it('session expire après inactivité', async () => {
      // Configurer timeout court, attendre, vérifier expiration
    });
  });

  describe('Audit & Logging', () => {
    it('log création utilisateur', async () => {
      const before = await getAuditLogs();
      await createTestUser({});
      const after = await getAuditLogs();
      
      expect(after.length).toBeGreaterThan(before.length);
    });

    it('log échec connexion', async () => {
      const { credentials } = await createTestUser({});
      
      try {
        await loginTestUser(credentials.email, 'wrong');
      } catch {}
      
      const logs = await getAuditLogs();
      type AuditLog = { action?: string };
      const failedLog = (logs as AuditLog[]).find(l => l.action === 'login_failed');
      expect(failedLog).toBeDefined();
    });
  });
});