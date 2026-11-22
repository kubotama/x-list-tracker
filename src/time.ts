export const isValidDateTime = (value: string) => {
  try {
    Temporal.PlainDateTime.from(value)
    return true
  } catch {
    return false
  }
}

export const formatDateTime = (value: string) =>
  Temporal.PlainDateTime.from(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

// 経過時間（分）を、表示用の文字列に変換する。0分以下（未来の日時を含む）は「たった今」
export const formatElapsed = (minutes: number) => {
  if (minutes < 1) {
    return 'たった今'
  }
  if (minutes < 60) {
    return `${minutes}分前`
  }
  if (minutes < 24 * 60) {
    return `${Math.floor(minutes / 60)}時間前`
  }
  return `${Math.floor(minutes / (24 * 60))}日前`
}

// 最後に読んだ日時から現在までの経過時間（分）を求める
export const getElapsedMinutes = (
  lastReadAt: string,
  now: Temporal.PlainDateTime,
) =>
  Temporal.PlainDateTime.from(lastReadAt).until(now, {
    largestUnit: 'minute',
  }).minutes

// 例: 2026/11/17 12:50（3分前）
export const formatLastRead = (
  lastReadAt: string,
  now: Temporal.PlainDateTime,
) =>
  `${formatDateTime(lastReadAt)}（${formatElapsed(getElapsedMinutes(lastReadAt, now))}）`
