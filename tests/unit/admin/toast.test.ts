/**
 * Unit tests for src/lib/admin/toast.ts
 * Tests the showToast notification system with DOM mocking.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { showToast, toastSuccess, toastError, toastWarning, toastInfo } from '@lib/admin/toast'

describe('admin/toast', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'admin-toast-container'
    document.body.appendChild(container)
    vi.useFakeTimers()
  })

  afterEach(() => {
    container.remove()
    vi.useRealTimers()
  })

  it('creates a toast element in the container', () => {
    showToast('Hello', 'success')
    const toast = container.querySelector('.alert.success')
    expect(toast).not.toBeNull()
    expect(toast?.getAttribute('role')).toBe('alert')
    expect(toast?.textContent).toContain('Hello')
  })

  it('uses correct data-status for each type', () => {
    const types = ['success', 'error', 'warning', 'info'] as const
    for (const type of types) {
      showToast(`Test ${type}`, type)
      const toast = container.querySelector(`.alert.${type}`)
      expect(toast?.getAttribute('data-status')).toBe(type)
    }
  })

  it('includes title when provided', () => {
    showToast('Body text', 'info', { title: 'My Title' })
    const strong = container.querySelector('strong')
    expect(strong?.textContent).toContain('My Title')
  })

  it('auto-dismisses after duration', () => {
    showToast('Auto-dismiss', 'success', { duration: 2000 })
    expect(container.children.length).toBe(1)
    vi.advanceTimersByTime(2000)
    // The toast should have the exiting class
    const toast = container.querySelector('.toast-exiting')
    expect(toast).not.toBeNull()
  })

  it('does not auto-dismiss when duration is 0', () => {
    showToast('Manual only', 'info', { duration: 0 })
    vi.advanceTimersByTime(10000)
    expect(container.querySelector('.toast-exiting')).toBeNull()
    expect(container.children.length).toBe(1)
  })

  it('close button triggers dismiss', () => {
    showToast('Close me', 'warning')
    const closeBtn = container.querySelector<HTMLButtonElement>('.alert-close')
    expect(closeBtn).not.toBeNull()
    closeBtn?.click()
    const exiting = container.querySelector('.toast-exiting')
    expect(exiting).not.toBeNull()
  })

  it('calls onClose callback when dismissed', () => {
    const onClose = vi.fn()
    showToast('With callback', 'info', { onClose, duration: 1000 })
    vi.advanceTimersByTime(1000)
    // Simulate animationend to trigger removal
    const toast = container.querySelector('.toast-exiting')
    toast?.dispatchEvent(new Event('animationend'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('escapes HTML in message', () => {
    showToast('<script>alert("xss")</script>', 'error')
    const toastEl = container.querySelector('.alert.error')
    expect(toastEl?.innerHTML).not.toContain('<script>')
  })

  it('escapes HTML in title', () => {
    showToast('body', 'info', { title: '<img onerror=alert(1)>' })
    const strong = container.querySelector('strong')
    expect(strong?.innerHTML).not.toContain('<img')
  })

  it('defaults to "info" type when no type given', () => {
    showToast('No type')
    const toast = container.querySelector('.alert.info')
    expect(toast).not.toBeNull()
  })

  describe('convenience helpers', () => {
    it('toastSuccess creates success toast', () => {
      toastSuccess('Win!')
      expect(container.querySelector('.alert.success')).not.toBeNull()
    })

    it('toastError creates error toast', () => {
      toastError('Fail')
      expect(container.querySelector('.alert.error')).not.toBeNull()
    })

    it('toastWarning creates warning toast', () => {
      toastWarning('Careful')
      expect(container.querySelector('.alert.warning')).not.toBeNull()
    })

    it('toastInfo creates info toast', () => {
      toastInfo('FYI')
      expect(container.querySelector('.alert.info')).not.toBeNull()
    })
  })

  describe('fallback when container missing', () => {
    it('falls back to alert() for errors when container absent', () => {
      container.remove()
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      showToast('Error fallback', 'error')
      expect(alertSpy).toHaveBeenCalledWith('Error fallback')
      alertSpy.mockRestore()
      // Re-add container for afterEach cleanup
      document.body.appendChild(container)
    })

    it('falls back to console.info for non-errors when container absent', () => {
      container.remove()
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      showToast('Info fallback', 'info')
      expect(consoleSpy).toHaveBeenCalledWith('[toast:info] Info fallback')
      consoleSpy.mockRestore()
      document.body.appendChild(container)
    })
  })
})
