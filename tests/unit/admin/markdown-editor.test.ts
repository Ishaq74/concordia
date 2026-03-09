/**
 * Unit tests for src/lib/admin/markdown-editor.ts
 * Tests initMarkdownEditors and getEditorValue with DOM mocking.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// vi.hoisted ensures these are initialised before vi.mock factories run
const { mockValue, mockMDE } = vi.hoisted(() => {
  const mockValue = vi.fn().mockReturnValue('')
  const mockMDE = {
    value: mockValue,
    codemirror: {
      getCursor: vi.fn().mockReturnValue({ line: 0, ch: 0 }),
      replaceRange: vi.fn(),
    },
  }
  return { mockValue, mockMDE }
})

vi.mock('easymde', () => ({
  // Regular function so it can be called with `new`
  default: function MockEasyMDE() { return mockMDE },
}))
vi.mock('easymde/dist/easymde.min.css', () => ({}))

import { initMarkdownEditors, getEditorValue } from '@lib/admin/markdown-editor'

describe('admin/markdown-editor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('initializes editors for [data-md-editor] wrappers', () => {
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-md-editor', 'content')
    const textarea = document.createElement('textarea')
    textarea.id = 'content'
    wrapper.appendChild(textarea)
    document.body.appendChild(wrapper)

    const editors = initMarkdownEditors()
    expect(editors.size).toBe(1)
    expect(editors.has('content')).toBe(true)
  })

  it('skips wrappers without textarea', () => {
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-md-editor', 'empty')
    document.body.appendChild(wrapper)

    const editors = initMarkdownEditors()
    expect(editors.size).toBe(0)
  })

  it('handles multiple editors', () => {
    for (const id of ['editor-a', 'editor-b', 'editor-c']) {
      const wrapper = document.createElement('div')
      wrapper.setAttribute('data-md-editor', id)
      const textarea = document.createElement('textarea')
      textarea.id = id
      wrapper.appendChild(textarea)
      document.body.appendChild(wrapper)
    }

    const editors = initMarkdownEditors()
    expect(editors.size).toBe(3)
  })

  it('detects minimal mode from data attribute', () => {
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-md-editor', 'minimal')
    wrapper.setAttribute('data-md-minimal', 'true')
    const textarea = document.createElement('textarea')
    textarea.id = 'minimal'
    wrapper.appendChild(textarea)
    document.body.appendChild(wrapper)

    const editors = initMarkdownEditors()
    expect(editors.size).toBe(1)
  })

  describe('getEditorValue', () => {
    it('returns value from editor instance', () => {
      mockValue.mockReturnValueOnce('# Hello')
      const editors = new Map<string, typeof mockMDE>()
      editors.set('test', mockMDE)

      const value = getEditorValue(editors as Parameters<typeof getEditorValue>[0], 'test')
      expect(value).toBe('# Hello')
    })

    it('falls back to textarea value when editor not found', () => {
      const textarea = document.createElement('textarea')
      textarea.id = 'fallback'
      textarea.value = 'text from textarea'
      document.body.appendChild(textarea)

      const editors = new Map()
      const value = getEditorValue(editors, 'fallback')
      expect(value).toBe('text from textarea')
    })

    it('returns empty string when no editor and no textarea found', () => {
      const editors = new Map()
      const value = getEditorValue(editors, 'nonexistent')
      expect(value).toBe('')
    })
  })
})
