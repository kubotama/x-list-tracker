import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { loadTabs, saveTabs } from './storage'
import {
  isValidTabName,
  MAX_TAB_NAME_LENGTH,
  normalizeTabName,
  tabsReducer,
} from './tabs'
import { formatLastRead } from './time'

const UPDATE_INTERVAL_MS = 60_000

// 現在時刻を保持し、一定間隔と、画面が再び表示されたときに更新する
const useNow = () => {
  const [now, setNow] = useState(() => Temporal.Now.plainDateTimeISO())

  const refreshNow = useCallback(() => {
    setNow(Temporal.Now.plainDateTimeISO())
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshNow()
      }
    }

    const intervalId = setInterval(refreshNow, UPDATE_INTERVAL_MS)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshNow])

  return [now, refreshNow] as const
}

const App = () => {
  const [tabs, dispatch] = useReducer(tabsReducer, null, loadTabs)
  const [now, refreshNow] = useNow()
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [dateTime, setDateTime] = useState('')
  const [tabName, setTabName] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const addDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    saveTabs(tabs)
  }, [tabs])

  const handleOpen = (tabId: string) => {
    setEditingTabId(tabId)
    setDateTime(
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
      refreshNow()
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
            onClick={() => handleOpen(tab.id)}
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
              {tab.lastReadAt ? formatLastRead(tab.lastReadAt, now) : '未記録'}
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
