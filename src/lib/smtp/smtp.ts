import 'dotenv/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// ==================== TYPES ====================

export interface EmailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: SmtpError;
}

export interface SmtpError {
  code: string;
  message: string;
  retryable: boolean;
  provider?: string;
}

export interface ProviderConfig {
  name: string;
  host: string;
  port: number;
  secure: boolean;
  requireTLS: boolean;
  auth: {
    user: string;
    pass: string;
  };
  pool?: boolean;
  maxConnections?: number;
  rateDelta?: number;
  rateLimit?: number;
}

// ==================== PROVIDERS ====================

const PROVIDERS: Record<string, Partial<ProviderConfig>> = {
  ionos: {
    name: 'IONOS',
    host: 'smtp.ionos.fr',
    port: 587,
    secure: false,
    requireTLS: true
  },
  ionos_ssl: {
    name: 'IONOS_SSL',
    host: 'smtp.ionos.fr',
    port: 465,
    secure: true,
    requireTLS: false
  },
  gmail: {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true
  },
  outlook: {
    name: 'Outlook',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    requireTLS: true
  },
  resend: {
    name: 'Resend',
    host: 'smtp.resend.com',
    port: 587,
    secure: false,
    requireTLS: true
  },
  sendgrid: {
    name: 'SendGrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    requireTLS: true
  },
  mailgun: {
    name: 'Mailgun',
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    requireTLS: true
  },
  postmark: {
    name: 'Postmark',
    host: 'smtp.postmarkapp.com',
    port: 587,
    secure: false,
    requireTLS: true
  },
  aws: {
    name: 'AWS SES',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false,
    requireTLS: true
  }
};

// ==================== CONFIG LOADER ====================

function loadConfig(): ProviderConfig {
  const providerKey = process.env.SMTP_PROVIDER?.toLowerCase();
  const providerPreset = providerKey ? PROVIDERS[providerKey] : null;

  const host = process.env.SMTP_HOST || providerPreset?.host;
  if (!host) {
    throw new Error(
      `SMTP_HOST manquant. Utilisez SMTP_PROVIDER=${Object.keys(PROVIDERS).join('|')} ou définissez SMTP_HOST manuellement`
    );
  }

  const port = parseInt(process.env.SMTP_PORT || String(providerPreset?.port || 587));
  const secure = (process.env.SMTP_SECURE === 'true') || providerPreset?.secure || false;
  const requireTLS = providerPreset?.requireTLS !== false;

  const user = process.env.SMTP_USER || process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.SMTP_API_KEY;

  if (!user || !pass) {
    throw new Error('SMTP_USER et SMTP_PASS (ou SMTP_PASSWORD/SMTP_API_KEY) sont requis');
  }

  return {
    name: providerPreset?.name || process.env.SMTP_PROVIDER || 'Custom',
    host,
    port,
    secure,
    requireTLS,
    auth: { user, pass },
    pool: process.env.SMTP_POOL !== 'false',
    maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS || '5'),
    rateDelta: parseInt(process.env.SMTP_RATE_DELTA || '1000'),
    rateLimit: parseInt(process.env.SMTP_RATE_LIMIT || '5')
  };
}

// ==================== SERVICE ====================

export class SmtpService {
  private transporter: Transporter;
  private config: ProviderConfig;
  private isMocked: boolean;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.isMocked = process.env.SMTP_MOCK === '1' || process.env.NODE_ENV === 'test';

    if (this.isMocked) {
      // Use nodemailer transport even in mock mode so test spies (vi.mock)
      // receive the sendMail calls via the mocked transporter.
      this.transporter = nodemailer.createTransport({ jsonTransport: true } as any) as any;

      if (process.env.NODE_ENV !== 'production') {
        console.log('[SMTP] Mode MOCK activé - pas de vrais emails envoyés');
      }

      return;
    }

    const transportConfig: any = {
      pool: config.pool,
      maxConnections: config.maxConnections,
      rateDelta: config.rateDelta,
      rateLimit: config.rateLimit,
      host: config.host,
      port: config.port,
      secure: config.secure,
      requireTLS: config.requireTLS,
      auth: {
            user: config.auth.user,
            pass: config.auth.pass
          }
    };

    if (config.name.includes('IONOS')) {
      transportConfig.authMethod = 'LOGIN';
    }

    this.transporter = nodemailer.createTransport(transportConfig);

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[SMTP] Provider: ${config.name} | ${config.host}:${config.port} | Secure: ${config.secure} | RequireTLS: ${config.requireTLS}`
      );
    }
  }

  async verify(): Promise<{ success: boolean; error?: SmtpError }> {
    try {
      await this.transporter.verify();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: this.classifyError(err)
      };
    }
  }

  async send(payload: EmailPayload, timeoutMs = 30000): Promise<SendResult> {
    const validation = this.validate(payload);
    if (!validation.valid) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error,
          retryable: false,
          provider: this.config.name
        }
      };
    }

    try {
      const result = await Promise.race([
        this.transporter.sendMail({
          from: payload.from || process.env.SMTP_FROM || this.config.auth.user,
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
          replyTo: payload.replyTo
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
        )
      ]);

      return {
        success: true,
        messageId: result.messageId
      };
    } catch (err: any) {
      return {
        success: false,
        error: this.classifyError(err)
      };
    }
  }

  async sendBatch(payloads: EmailPayload[], concurrency = 3): Promise<SendResult[]> {
    const results: SendResult[] = [];

    for (let i = 0; i < payloads.length; i += concurrency) {
      const batch = payloads.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(p => this.send(p)));
      results.push(...batchResults);
    }

    return results;
  }

  private validate(payload: EmailPayload): { valid: true } | { valid: false; error: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!payload.to || !emailRegex.test(payload.to)) {
      return { valid: false, error: `Invalid recipient email: ${payload.to}` };
    }
    if (payload.from && !emailRegex.test(payload.from)) {
      return { valid: false, error: `Invalid sender email: ${payload.from}` };
    }
    if (!payload.subject?.trim()) {
      return { valid: false, error: 'Subject is required' };
    }
    if (!payload.text && !payload.html) {
      return { valid: false, error: 'Email content (text or html) is required' };
    }
    if (payload.subject.length > 998) {
      return { valid: false, error: 'Subject too long (max 998 chars)' };
    }

    return { valid: true };
  }

  private classifyError(err: any): SmtpError {
    const code = err.code || 'UNKNOWN';
    const message = err.message || 'Unknown error';

    const retryableCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'EPIPE'];

    const isRetryable = retryableCodes.includes(code);
    const isAuthError =
      code === 'EAUTH' ||
      message.toLowerCase().includes('auth') ||
      message.toLowerCase().includes('credentials') ||
      message.toLowerCase().includes('login') ||
      message.includes('535');

    return {
      code: isAuthError ? 'AUTH_FAILED' : code,
      message: isAuthError ? `Authentication failed: ${message}` : message,
      retryable: isRetryable,
      provider: this.config.name
    };
  }

  getConfig(): Readonly<ProviderConfig> {
    return Object.freeze({ ...this.config });
  }

  async close(): Promise<void> {
    this.transporter.close();
  }
}

// ==================== EXPORT ====================

export const smtp = new SmtpService(loadConfig());
export { PROVIDERS };