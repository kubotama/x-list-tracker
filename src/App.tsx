import { useEffect, useReducer, useRef, useState } from 'react'

type Tab = {
  id: string
  name: string
  lastReadAt: string | null // 'YYYY-MM-DDTHH:mm'、未記録は null
}

type StoredData = {
  version: 1
  tabs: Tab[]
}

type TabsAction =
  | { type: 'add'; id: string; name: string }
  | { type: 'setLastReadAt'; id: string; value: string }

const MAX_TAB_NAME_LENGTH = 32
const STORAGE_KEY = 'x-list-tracker'
const STORAGE_VERSION = 1

const initialTabs: Tab[] = [
  { id: 'following', name: 'フォロー中', lastReadAt: null },
]

const tabsReducer = (tabs: Tab[], action: TabsAction): Tab[] => {
  switch (action.type) {
    case 'add':
      return [...tabs, { id: action.id, name: action.name, lastReadAt: null }]
    case 'setLastReadAt':
      return tabs.map((tab) =>
        tab.id === action.id ? { ...tab, lastReadAt: action.value } : tab,
      )
  }
}

// タブ名の前後の空白を取り除く
const normalizeTabName = (name: string) => name.trim()

// 空文字、または最大長を超える名前は不正（重複は認める）
const isValidTabName = (name: string) => {
  const normalized = normalizeTabName(name)
  return normalized.length > 0 && normalized.length <= MAX_TAB_NAME_LENGTH
}

const isValidDateTime = (value: string) => {
  try {
    Temporal.PlainDateTime.from(value)
    return true
  } catch {
    return false
  }
}

const isTab = (value: unknown): value is Tab => {
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
const parseStoredTabs = (json: string | null): Tab[] | null => {
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

const loadTabs = (): Tab[] => {
  try {
    return parseStoredTabs(localStorage.getItem(STORAGE_KEY)) ?? initialTabs
  } catch {
    return initialTabs
  }
}

const saveTabs = (tabs: Tab[]) => {
  try {
    const data: StoredData = { version: STORAGE_VERSION, tabs }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // 保存に失敗しても、アプリは動作を続ける
  }
}

const formatDateTime = (value: string) =>
  Temporal.PlainDateTime.from(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

const App = () => {
  const [tabs, dispatch] = useReducer(tabsReducer, null, loadTabs)
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [dateTime, setDateTime] = useState('')
  const [tabName, setTabName] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const addDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    saveTabs(tabs)
  }, [tabs])

  const handleOpen = (tab: Tab) => {
    setEditingTabId(tab.id)
    setDateTime(
      tab.lastReadAt ??
        Temporal.Now.plainDateTimeISO().toString({
          smallestUnit: 'minute',
        }),
    )

    dialogRef.current?.showModal()
  }

  const handleClose = () => {
    dialogRef.current?.close()
  }

  const handleConfirm = () => {
    if (editingTabId !== null) {
      dispatch({ type: 'setLastReadAt', id: editingTabId, value: dateTime })
    }
    handleClose()
  }

  const handleOpenAdd = () => {
    setTabName('')
    addDialogRef.current?.showModal()
  }

  const handleCloseAdd = () => {
    addDialogRef.current?.close()
  }

  const handleAdd = () => {
    if (!isValidTabName(tabName)) {
      return
    }
    dispatch({
      type: 'add',
      id: crypto.randomUUID(),
      name: normalizeTabName(tabName),
    })
    handleCloseAdd()
  }

  return (
    <>
      <main>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleOpen(tab)}
            style={{
              display: 'block',
              width: '100%',
              padding: '16px',
              border: '1px solid blue',
              background: 'transparent',
              color: 'inherit',
              textAlign: 'left',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            <div>{tab.name}</div>
            <div>
              {tab.lastReadAt ? formatDateTime(tab.lastReadAt) : '未記録'}
            </div>
          </button>
        ))}

        <button type="button" onClick={handleOpenAdd}>
          タブを追加
        </button>
      </main>

      <dialog
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            handleClose()
          }
        }}
      >
        <p>日時の入力</p>

        <label htmlFor="date-time">日時</label>
        <input
          id="date-time"
          type="datetime-local"
          value={dateTime}
          onChange={(event) => setDateTime(event.target.value)}
        />
        <button type="button" onClick={handleConfirm} disabled={!dateTime}>
          確定
        </button>
      </dialog>

      <dialog
        ref={addDialogRef}
        onClick={(event) => {
          if (event.target === addDialogRef.current) {
            handleCloseAdd()
          }
        }}
      >
        <p>タブの追加</p>

        <label htmlFor="tab-name">名前</label>
        <input
          id="tab-name"
          type="text"
          maxLength={MAX_TAB_NAME_LENGTH}
          value={tabName}
          onChange={(event) => setTabName(event.target.value)}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!isValidTabName(tabName)}
        >
          追加
        </button>
      </dialog>
    </>
  )
}

export default App
