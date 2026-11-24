import { describe, expect, it } from 'vitest'
import {
  isValidTabName,
  MAX_TAB_NAME_LENGTH,
  normalizeTabName,
  tabsReducer,
  type Tab,
} from './tabs'

describe('normalizeTabName', () => {
  it('前後の空白を取り除く', () => {
    expect(normalizeTabName('  リスト  ')).toBe('リスト')
  })

  it('前後の全角の空白も取り除く', () => {
    expect(normalizeTabName('\u3000リスト\u3000')).toBe('リスト')
  })

  it('途中の空白は残す', () => {
    expect(normalizeTabName('A B')).toBe('A B')
  })
})

describe('isValidTabName', () => {
  it('空文字は不正', () => {
    expect(isValidTabName('')).toBe(false)
  })

  it('空白のみは不正（全角の空白を含む）', () => {
    expect(isValidTabName('   ')).toBe(false)
    expect(isValidTabName('\u3000\u3000')).toBe(false)
  })

  it('1文字は有効', () => {
    expect(isValidTabName('a')).toBe(true)
  })

  it('最大長の名前は有効', () => {
    expect(isValidTabName('a'.repeat(MAX_TAB_NAME_LENGTH))).toBe(true)
  })

  it('最大長を超える名前は不正', () => {
    expect(isValidTabName('a'.repeat(MAX_TAB_NAME_LENGTH + 1))).toBe(false)
  })

  it('前後の空白は、取り除いた長さで判定する', () => {
    expect(isValidTabName(` ${'a'.repeat(MAX_TAB_NAME_LENGTH)} `)).toBe(true)
  })
})

describe('tabsReducer', () => {
  const tabs: Tab[] = [
    { id: 'a', name: 'A', lastReadAt: null },
    { id: 'b', name: 'B', lastReadAt: '2026-11-17T12:50' },
  ]

  describe('add', () => {
    it('末尾にタブを追加し、lastReadAt は null になる', () => {
      const result = tabsReducer(tabs, { type: 'add', id: 'c', name: 'C' })

      expect(result).toEqual([
        { id: 'a', name: 'A', lastReadAt: null },
        { id: 'b', name: 'B', lastReadAt: '2026-11-17T12:50' },
        { id: 'c', name: 'C', lastReadAt: null },
      ])
    })

    it('元の配列を変更しない', () => {
      const before = structuredClone(tabs)

      tabsReducer(tabs, { type: 'add', id: 'c', name: 'C' })

      expect(tabs).toEqual(before)
    })
  })

  describe('setLastReadAt', () => {
    it('対象のタブだけを更新する', () => {
      const result = tabsReducer(tabs, {
        type: 'setLastReadAt',
        id: 'a',
        value: '2026-11-18T08:00',
      })

      expect(result).toEqual([
        { id: 'a', name: 'A', lastReadAt: '2026-11-18T08:00' },
        { id: 'b', name: 'B', lastReadAt: '2026-11-17T12:50' },
      ])
    })

    it('存在しない id では、内容が変わらない', () => {
      const result = tabsReducer(tabs, {
        type: 'setLastReadAt',
        id: 'unknown',
        value: '2026-11-18T08:00',
      })

      expect(result).toEqual(tabs)
    })

    it('元の配列を変更しない', () => {
      const before = structuredClone(tabs)

      tabsReducer(tabs, {
        type: 'setLastReadAt',
        id: 'a',
        value: '2026-11-18T08:00',
      })

      expect(tabs).toEqual(before)
    })
  })

  describe('rename', () => {
    it('対象のタブの名前だけを更新し、日時は変えない', () => {
      const result = tabsReducer(tabs, {
        type: 'rename',
        id: 'b',
        name: 'B2',
      })

      expect(result).toEqual([
        { id: 'a', name: 'A', lastReadAt: null },
        { id: 'b', name: 'B2', lastReadAt: '2026-11-17T12:50' },
      ])
    })

    it('存在しない id では、内容が変わらない', () => {
      const result = tabsReducer(tabs, {
        type: 'rename',
        id: 'unknown',
        name: 'X',
      })

      expect(result).toEqual(tabs)
    })

    it('元の配列を変更しない', () => {
      const before = structuredClone(tabs)

      tabsReducer(tabs, { type: 'rename', id: 'a', name: 'A2' })

      expect(tabs).toEqual(before)
    })
  })
})
