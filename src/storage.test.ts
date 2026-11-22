import { describe, expect, it } from 'vitest'
import { isTab, parseStoredTabs } from './storage'

const toJson = (data: unknown) => JSON.stringify(data)

describe('isTab', () => {
  it('lastReadAt が null のタブは有効', () => {
    expect(isTab({ id: 'a', name: 'A', lastReadAt: null })).toBe(true)
  })

  it('lastReadAt が日時のタブは有効', () => {
    expect(isTab({ id: 'a', name: 'A', lastReadAt: '2026-11-17T12:50' })).toBe(
      true,
    )
  })

  const invalidTabs: [string, unknown][] = [
    ['null', null],
    ['文字列', 'abc'],
    ['数値', 1],
    ['id がない', { name: 'A', lastReadAt: null }],
    ['id が文字列でない', { id: 1, name: 'A', lastReadAt: null }],
    ['name がない', { id: 'a', lastReadAt: null }],
    ['name が文字列でない', { id: 'a', name: 1, lastReadAt: null }],
    ['lastReadAt がない', { id: 'a', name: 'A' }],
    ['lastReadAt が数値', { id: 'a', name: 'A', lastReadAt: 1 }],
    ['lastReadAt が日時として不正', { id: 'a', name: 'A', lastReadAt: 'abc' }],
  ]

  it.each(invalidTabs)('%s は不正', (_name, value) => {
    expect(isTab(value)).toBe(false)
  })
})

describe('parseStoredTabs', () => {
  const validTabs = [
    { id: 'a', name: 'A', lastReadAt: null },
    { id: 'b', name: 'B', lastReadAt: '2026-11-17T12:50' },
  ]

  describe('有効なデータ', () => {
    it('tabs を返す', () => {
      expect(parseStoredTabs(toJson({ version: 1, tabs: validTabs }))).toEqual(
        validTabs,
      )
    })

    it('1件のタブでも返す', () => {
      const tabs = [{ id: 'a', name: 'A', lastReadAt: null }]

      expect(parseStoredTabs(toJson({ version: 1, tabs }))).toEqual(tabs)
    })
  })

  describe('null を返す場合', () => {
    it('入力が null', () => {
      expect(parseStoredTabs(null)).toBeNull()
    })

    it('JSON として不正な文字列', () => {
      expect(parseStoredTabs('{')).toBeNull()
    })

    it.each([
      ['数値', '123'],
      ['文字列', '"abc"'],
      ['null', 'null'],
      ['配列', '[]'],
    ])('JSON だが、オブジェクトでない値（%s）', (_name, json) => {
      expect(parseStoredTabs(json)).toBeNull()
    })

    it.each([
      ['version が 1 でない', { version: 2, tabs: validTabs }],
      ['version が文字列', { version: '1', tabs: validTabs }],
      ['version がない', { tabs: validTabs }],
      ['tabs が配列でない', { version: 1, tabs: 'abc' }],
      ['tabs がオブジェクト', { version: 1, tabs: {} }],
      ['tabs がない', { version: 1 }],
      ['tabs が空', { version: 1, tabs: [] }],
      [
        '不正なタブが含まれる',
        { version: 1, tabs: [...validTabs, { id: 1, name: 'C' }] },
      ],
      [
        'lastReadAt が日時として不正',
        {
          version: 1,
          tabs: [{ id: 'a', name: 'A', lastReadAt: 'abc' }],
        },
      ],
    ])('%s', (_name, data) => {
      expect(parseStoredTabs(toJson(data))).toBeNull()
    })
  })
})
