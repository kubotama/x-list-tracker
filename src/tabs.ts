export type Tab = {
  id: string
  name: string
  lastReadAt: string | null // 'YYYY-MM-DDTHH:mm'、未記録は null
}

export type TabsAction =
  | { type: 'add'; id: string; name: string }
  | { type: 'rename'; id: string; name: string }
  | { type: 'setLastReadAt'; id: string; value: string }

export const MAX_TAB_NAME_LENGTH = 32

export const initialTabs: Tab[] = [
  { id: 'following', name: 'フォロー中', lastReadAt: null },
]

export const tabsReducer = (tabs: Tab[], action: TabsAction): Tab[] => {
  switch (action.type) {
    case 'add':
      return [...tabs, { id: action.id, name: action.name, lastReadAt: null }]
    case 'rename':
      return tabs.map((tab) =>
        tab.id === action.id ? { ...tab, name: action.name } : tab,
      )
    case 'setLastReadAt':
      return tabs.map((tab) =>
        tab.id === action.id ? { ...tab, lastReadAt: action.value } : tab,
      )
  }
}

// タブ名の前後の空白を取り除く
export const normalizeTabName = (name: string) => name.trim()

// 空文字、または最大長を超える名前は不正（重複は認める）
export const isValidTabName = (name: string) => {
  const normalized = normalizeTabName(name)
  return normalized.length > 0 && normalized.length <= MAX_TAB_NAME_LENGTH
}
