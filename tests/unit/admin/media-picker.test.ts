/**
 * Unit tests for src/lib/admin/media-picker.ts
 * Tests the openMediaPicker function with DOM mocking.
 *
 * The media-picker module keeps a module-level `isInitialized` flag and only
 * attaches DOM event listeners once. DOM must therefore persist across tests
 * so the listeners remain bound to live elements.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { openMediaPicker } from '@lib/admin/media-picker'

function createPickerDOM() {
  const overlay = document.createElement('div')
  overlay.id = 'media-picker-overlay'
  overlay.style.display = 'none'

  const searchInput = document.createElement('input')
  searchInput.id = 'mp-search'
  overlay.appendChild(searchInput)

  const selectBtn = document.createElement('button')
  selectBtn.id = 'mp-btn-select'
  overlay.appendChild(selectBtn)

  const closeBtn = document.createElement('button')
  closeBtn.id = 'mp-close'
  overlay.appendChild(closeBtn)

  const cancelBtn = document.createElement('button')
  cancelBtn.id = 'mp-btn-cancel'
  overlay.appendChild(cancelBtn)

  const grid = document.createElement('div')
  grid.id = 'mp-grid'
  overlay.appendChild(grid)

  const tabLib = document.createElement('div')
  tabLib.className = 'mp-tab'
  tabLib.dataset.mpTab = 'library'
  overlay.appendChild(tabLib)

  const tabUpload = document.createElement('div')
  tabUpload.className = 'mp-tab'
  tabUpload.dataset.mpTab = 'upload'
  overlay.appendChild(tabUpload)

  const panelLib = document.createElement('div')
  panelLib.id = 'mp-panel-library'
  panelLib.className = 'mp-panel'
  overlay.appendChild(panelLib)

  const panelUpload = document.createElement('div')
  panelUpload.id = 'mp-panel-upload'
  panelUpload.className = 'mp-panel'
  overlay.appendChild(panelUpload)

  const uploadZone = document.createElement('div')
  uploadZone.id = 'mp-upload-zone'
  overlay.appendChild(uploadZone)

  const fileInput = document.createElement('input')
  fileInput.id = 'mp-file-input'
  fileInput.type = 'file'
  overlay.appendChild(fileInput)

  const pagination = document.createElement('div')
  pagination.id = 'mp-pagination'
  overlay.appendChild(pagination)

  for (const id of ['mp-meta-filename', 'mp-meta-alt', 'mp-meta-caption']) {
    const input = document.createElement('input')
    input.id = id
    overlay.appendChild(input)
  }
  const desc = document.createElement('textarea')
  desc.id = 'mp-meta-description'
  overlay.appendChild(desc)

  const skipMetaBtn = document.createElement('button')
  skipMetaBtn.id = 'mp-btn-skip-meta'
  overlay.appendChild(skipMetaBtn)

  const saveMetaBtn = document.createElement('button')
  saveMetaBtn.id = 'mp-btn-save-meta'
  overlay.appendChild(saveMetaBtn)

  const metaForm = document.createElement('div')
  metaForm.id = 'mp-meta-form'
  metaForm.style.display = 'none'
  overlay.appendChild(metaForm)

  document.body.appendChild(overlay)
  return overlay
}

describe('admin/media-picker', () => {
  let overlay: HTMLDivElement

  // Persistent DOM — listeners survive across tests
  beforeAll(() => {
    overlay = createPickerDOM() as HTMLDivElement
  })

  afterAll(() => {
    overlay.remove()
  })

  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        media: [],
        total: 0,
        page: 1,
        perPage: 24,
        totalPages: 0,
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens the modal overlay', async () => {
    const promise = openMediaPicker()
    expect(overlay.style.display).toBe('flex')
    document.getElementById('mp-close')?.click()
    const result = await promise
    expect(result).toBeNull()
  })

  it('returns null when cancelled', async () => {
    const promise = openMediaPicker()
    document.getElementById('mp-btn-cancel')?.click()
    const result = await promise
    expect(result).toBeNull()
  })

  it('returns null when closed via close button', async () => {
    const promise = openMediaPicker()
    document.getElementById('mp-close')?.click()
    const result = await promise
    expect(result).toBeNull()
  })

  it('returns null when overlay not found', async () => {
    overlay.remove()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await openMediaPicker()
    expect(result).toBeNull()
    consoleSpy.mockRestore()
    // Re-add so subsequent tests and afterAll work
    document.body.appendChild(overlay)
  })

  it('closes on Escape key', async () => {
    const promise = openMediaPicker()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    const result = await promise
    expect(result).toBeNull()
  })

  it('uses custom apiBase when provided', async () => {
    const promise = openMediaPicker({ apiBase: '/api/admin/services/media' })
    await vi.waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled()
    })
    const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0][0] as string
    expect(fetchCall).toContain('/api/admin/services/media')
    document.getElementById('mp-close')?.click()
    await promise
  })

  it('resets search input on open', async () => {
    const searchInput = document.getElementById('mp-search') as HTMLInputElement
    searchInput.value = 'old search'
    const promise = openMediaPicker()
    expect(searchInput.value).toBe('')
    document.getElementById('mp-close')?.click()
    await promise
  })

  it('disables select button on open', async () => {
    const selectBtn = document.getElementById('mp-btn-select') as HTMLButtonElement
    const promise = openMediaPicker()
    expect(selectBtn.disabled).toBe(true)
    document.getElementById('mp-close')?.click()
    await promise
  })
})
