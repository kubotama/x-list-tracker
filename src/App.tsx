import { useReducer, useRef, useState } from 'react'

type Tab = {
  id: string
  name: string
  lastReadAt: string | null // 'YYYY-MM-DDTHH:mm'、未記録は null
}

type TabsAction = { type: 'setLastReadAt'; id: string; value: string }

const initialTabs: Tab[] = [
  { id: 'following', name: 'フォロー中', lastReadAt: null },
]

const tabsReducer = (tabs: Tab[], action: TabsAction): Tab[] => {
  switch (action.type) {
    case 'setLastReadAt':
      return tabs.map((tab) =>
        tab.id === action.id ? { ...tab, lastReadAt: action.value } : tab,
      )
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
  const [tabs, dispatch] = useReducer(tabsReducer, initialTabs)
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [dateTime, setDateTime] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)

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
    </>
  )
}

export default App
