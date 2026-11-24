export type Tab = {
  id: string
  name: string
  lastReadAt: string | null // 'YYYY-MM-DDTHH:mm'、未記録は null
}

export type TabsAction =
  | { type: 'add'; id: string; name: string }
  | { type: 'rename'; id: string; name: string }
  | { type: 'remove'; id: string }
  | { type: 'setLastReadAt'; id: string; value: string }

export const MAX_TAB_NAME_LENGTH = 32

// 初期タブ（「フォロー中」）の id。このタブは削除できない
export const FOLLOWING_TAB_ID = 'following'

export const initialTabs: Tab[] = [
  { id: FOLLOWING_TAB_ID, name: 'フォロー中', lastReadAt: null },
]

// 初期タブ以外は削除できる
export const isDeletableTab = (id: string) => id !== FOLLOWING_TAB_ID

export const tabsReducer = (tabs: Tab[], action: TabsAction): Tab[] => {
  switch (action.type) {
    case 'add':
      return [...tabs, { id: action.id, name: action.name, lastReadAt: null }]
    case 'rename':
      return tabs.map((tab) =>
        tab.id === action.id ? { ...tab, name: action.name } : tab,
      )
    case 'remove':
      // 削除できないタブは、画面の制御に加えて、ここでも無視する
      if (!isDeletableTab(action.id)) {
        return tabs
      }
      return tabs.filter((tab) => tab.id !== action.id)
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
