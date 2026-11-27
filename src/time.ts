export const isValidDateTime = (value: string) => {
  try {
    Temporal.PlainDateTime.from(value)
    return true
  } catch {
    return false
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export const formatDateTime = (value: string) => {
  const { year, month, day, hour, minute } = Temporal.PlainDateTime.from(value)

  return `${year}/${pad(month)}/${pad(day)} ${pad(hour)}:${pad(minute)}`
}

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
