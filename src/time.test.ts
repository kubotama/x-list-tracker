import { describe, expect, it } from 'vitest'
import {
  formatDateTime,
  formatElapsed,
  getElapsedMinutes,
  isValidDateTime,
} from './time'

describe('isValidDateTime', () => {
  it('YYYY-MM-DDTHH:mm 形式は有効', () => {
    expect(isValidDateTime('2026-11-17T12:50')).toBe(true)
  })

  it.each([
    ['空文字', ''],
    ['日時でない文字列', 'abc'],
    ['存在しない月', '2026-13-01T00:00'],
    ['存在しない日', '2026-02-30T00:00'],
    ['存在しない時', '2026-11-17T25:00'],
  ])('%s は不正', (_name, value) => {
    expect(isValidDateTime(value)).toBe(false)
  })
})

describe('formatDateTime', () => {
  it('YYYY/MM/DD HH:mm の形式になる', () => {
    expect(formatDateTime('2026-11-17T12:50')).toBe('2026/11/17 12:50')
  })

  it('月、日、時、分が2桁にそろう', () => {
    expect(formatDateTime('2026-01-05T09:05')).toBe('2026/01/05 09:05')
  })
})

describe('formatElapsed', () => {
  const cases: [number, string][] = [
    [-5, 'たった今'],
    [0, 'たった今'],
    [1, '1分前'],
    [59, '59分前'],
    [60, '1時間前'],
    [119, '1時間前'],
    [1439, '23時間前'],
    [1440, '1日前'],
    [2879, '1日前'],
    [2880, '2日前'],
  ]

  it.each(cases)('%i分は「%s」と表示する', (minutes, expected) => {
    expect(formatElapsed(minutes)).toBe(expected)
  })
})

describe('getElapsedMinutes', () => {
  const now = Temporal.PlainDateTime.from('2026-11-17T12:55')

  it('同じ日時は0分', () => {
    expect(getElapsedMinutes('2026-11-17T12:55', now)).toBe(0)
  })

  it('分単位の差を求める', () => {
    expect(getElapsedMinutes('2026-11-17T12:50', now)).toBe(5)
  })

  it('秒の端数は切り捨てる', () => {
    const nowWithSeconds = Temporal.PlainDateTime.from('2026-11-17T12:55:59')

    expect(getElapsedMinutes('2026-11-17T12:50', nowWithSeconds)).toBe(5)
  })

  it('日をまたぐ場合も正しく求める', () => {
    const nextDay = Temporal.PlainDateTime.from('2026-11-17T00:10')

    expect(getElapsedMinutes('2026-11-16T23:50', nextDay)).toBe(20)
  })

  it('複数日の差も分単位で求める', () => {
    expect(getElapsedMinutes('2026-11-14T12:55', now)).toBe(3 * 24 * 60)
  })

  it('未来の日時は負の値になる', () => {
    expect(getElapsedMinutes('2026-11-17T13:00', now)).toBe(-5)
  })
})
