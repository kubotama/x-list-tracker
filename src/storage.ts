import { initialTabs, type Tab } from './tabs'
import { isValidDateTime } from './time'

type StoredData = {
  version: 1
  tabs: Tab[]
}

const STORAGE_KEY = 'x-list-tracker'
const STORAGE_VERSION = 1

export const isTab = (value: unknown): value is Tab => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const { id, name, lastReadAt } = value as Record<string, unknown>
  return (
    typeof id === 'string' &&
    typeof name === 'string' &&
    (lastReadAt === null ||
      (typeof lastReadAt === 'string' && isValidDateTime(lastReadAt)))
  )
}

// 保存された文字列から tabs を取り出す。不正な場合は null を返す
export const parseStoredTabs = (json: string | null): Tab[] | null => {
  if (json === null) {
    return null
  }
  try {
    const data: unknown = JSON.parse(json)
    if (typeof data !== 'object' || data === null) {
      return null
    }
    const { version, tabs } = data as Record<string, unknown>
    if (version !== STORAGE_VERSION || !Array.isArray(tabs)) {
      return null
    }
    const parsed: unknown[] = tabs
    if (parsed.length === 0 || !parsed.every(isTab)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const loadTabs = (): Tab[] => {
  try {
    return parseStoredTabs(localStorage.getItem(STORAGE_KEY)) ?? initialTabs
  } catch {
    return initialTabs
  }
}

export const saveTabs = (tabs: Tab[]) => {
  try {
    const data: StoredData = { version: STORAGE_VERSION, tabs }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // 保存に失敗しても、アプリは動作を続ける
  }
}
