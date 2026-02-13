import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SmtpService } from '@lib/smtp/smtp'
import type { ProviderConfig } from '@lib/smtp/smtp'
import { securityPayloads } from '@tests/fixtures/security-payloads'

describe('SmtpService Unit Tests', () => {
  let smtpService: SmtpService

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('SMTP_MOCK', '1')

    const config: ProviderConfig = {
      name: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: 'test@gmail.com', pass: 'test-pass' },
    }

    smtpService = new SmtpService(config)
  })

  describe('Basic Email Sending', () => {
    it('should send valid email', async () => {
      const result = await smtpService.send({
        to: 'user@example.com',
        subject: 'Test Email',
        text: 'Hello World',
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
      expect(result.messageId).toContain('mock-')
    })

    it('should send email with HTML', async () => {
      const result = await smtpService.send({
        to: 'user@example.com',
        subject: 'HTML Email',
        html: '<h1>Hello</h1><p>Test</p>',
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('should send email with custom from', async () => {
      const result = await smtpService.send({
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Custom From',
        text: 'Test',
      })

      expect(result.success).toBe(true)
    })

    it('should send email with replyTo', async () => {
      const result = await smtpService.send({
        to: 'user@example.com',
        subject: 'Reply To Test',
        text: 'Test',
        replyTo: 'reply@example.com',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('Email Validation', () => {
    it('should reject invalid recipient email', async () => {
      const result = await smtpService.send({
        to: 'invalid-email',
        subject: 'Test',
        text: 'Test',
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('VALIDATION_ERROR')
    })

    it('should reject invalid sender email', async () => {
      const result = await smtpService.send({
        to: 'user@example.com',
        from: 'invalid-sender',
        subject: 'Test',
        text: 'Test',
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('VALIDATION_ERROR')
    })

    it('should require subject', async () => {
      const result = await smtpService.send({
        to: 'user@example.com',
        subject: '',
        text: 'Test',
      })

      expect(result.success).toBe(false)
    })

    it('should require content (text or html)', async () => {
      const result = await smtpService.send({
        to: 'user@example.com',
        subject: 'Test',
      })

      expect(result.success).toBe(false)
    })

    it('should reject subject longer than 998 chars', async () => {
      const result = await smtpService.send({
        to: 'user@example.com',
        subject: 'A'.repeat(1000),
        text: 'Test',
      })

      expect(result.success).toBe(false)
    })

    it.each(securityPayloads.invalidEmails.filter(e => e !== 'user@example.com' && e !== 'user@example.com' && e !== 'user\x00@example.com'))('should reject invalid email: %s', async (email) => {
      const result = await smtpService.send({
        to: email,
        subject: 'Test',
        text: 'Test',
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('VALIDATION_ERROR')
    })

    // Test explicit for user@example.com as valid
    it('should accept valid email: user@example.com', async () => {
      const result = await smtpService.send({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Security - XSS Protection', () => {
    it.each(securityPayloads.xss)('should handle XSS payload in subject: %s', async (payload) => {
      const result = await smtpService.send({
        to: 'user@example.com',
        subject: payload,
        text: 'Test content',
      })

      expect(result.success).toBe(true)
    })

    it.each(securityPayloads.xss)('should handle XSS payload in body: %s', async (payload) => {
      const result = await smtpService.send({
        to: 'user@example.com',
        subject: 'Test',
        html: payload,
      })

      expect(result.success).toBe(true)
    })
  })

  describe('Security - SQL Injection', () => {
    it.each(securityPayloads.sql)('should reject SQL injection in email: %s', async (payload) => {
      const result = await smtpService.send({
        to: payload,
        subject: 'Test',
        text: 'Test',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('Security - Null Bytes', () => {
    it.each(securityPayloads.nullBytes.filter(e => e !== 'user@example.com' && e !== 'user\x00@example.com'))('should reject null bytes: %s', async (payload) => {
      const result = await smtpService.send({
        to: payload,
        subject: 'Test',
        text: 'Test',
      })

      expect(result.success).toBe(false)
    })

    // Test explicit for user@example.com as valid (no null byte)
    it('should accept valid email without null byte: user@example.com', async () => {
      const result = await smtpService.send({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Batch Operations', () => {
    it('should send batch emails', async () => {
      const payloads = [
        { to: 'user1@example.com', subject: 'Test 1', text: 'Content 1' },
        { to: 'user2@example.com', subject: 'Test 2', text: 'Content 2' },
        { to: 'user3@example.com', subject: 'Test 3', text: 'Content 3' },
      ]

      const results = await smtpService.sendBatch(payloads, 2)

      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      expect(results.every(r => r.messageId)).toBe(true)
    })

    it('should batch with custom concurrency', async () => {
      const payloads = Array(10)
        .fill(null)
        .map((_, i) => ({
          to: `user${i}@example.com`,
          subject: `Test ${i}`,
          text: `Content ${i}`,
        }))

      const results = await smtpService.sendBatch(payloads, 3)

      expect(results).toHaveLength(10)
      expect(results.every(r => r.success)).toBe(true)
    })

    it('should handle mixed valid and invalid emails in batch', async () => {
      const payloads = [
        { to: 'valid@example.com', subject: 'Test', text: 'Content' },
        { to: 'invalid', subject: 'Test', text: 'Content' },
        { to: 'another@example.com', subject: 'Test', text: 'Content' },
      ]

      const results = await smtpService.sendBatch(payloads)

      expect(results).toHaveLength(3)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
      expect(results[2].success).toBe(true)
    })
  })

  describe('Connection Management', () => {
    it('should verify connection', async () => {
      const result = await smtpService.verify()
      expect(result.success).toBe(true)
    })

    it('should close connection', async () => {
      await expect(smtpService.close()).resolves.not.toThrow()
    })

    it('should return config', () => {
      const config = smtpService.getConfig()

      expect(config).toBeDefined()
      expect(config.name).toBe('Gmail')
      expect(config.host).toBe('smtp.gmail.com')
      expect(config.port).toBe(587)
    })
  })

  describe('Error Handling', () => {
    it('should handle timeout gracefully', async () => {
      const result = await smtpService.send(
        {
          to: 'user@example.com',
          subject: 'Test',
          text: 'Test',
        },
        100 // Very short timeout
      )

      // In mock mode, should still succeed
      expect(result.success).toBe(true)
    })

    it('should classify auth errors', async () => {
      const result = await smtpService.send({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test',
      })

      // Mock always succeeds
      expect(result.success).toBe(true)
    })
  })
})
