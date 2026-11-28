import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Modal } from './Modal'
import { formatDateTime, formatElapsed, getElapsedMinutes } from './time'
import { loadSettings, loadTabs, saveSettings, saveTabs } from './storage'
import {
  isDeletableTab,
  isValidTabName,
  MAX_TAB_NAME_LENGTH,
  normalizeTabName,
  tabsReducer,
  type Tab,
} from './tabs'

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
  const [settings, setSettings] = useState(loadSettings)
  const [now, refreshNow] = useNow()
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingTabName, setEditingTabName] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [tabName, setTabName] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const addDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    saveTabs(tabs)
  }, [tabs])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const editingTab = tabs.find((tab) => tab.id === editingTabId)
  const isEditingTabNameValid = isValidTabName(editingTabName)
  const isEditingTabNameChanged =
    editingTab !== undefined &&
    normalizeTabName(editingTabName) !== editingTab.name
  const canDeleteEditingTab =
    editingTab !== undefined && isDeletableTab(editingTab.id)

  const handleOpen = (tab: Tab) => {
    setEditingTabId(tab.id)
    setEditingTabName(tab.name)
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

  // 指定した日時と、変更されていればタブ名を、あわせて反映する
  const confirmWith = (value: string) => {
    if (editingTabId === null || !isEditingTabNameValid) {
      return
    }
    dispatch({ type: 'setLastReadAt', id: editingTabId, value })
    if (isEditingTabNameChanged) {
      dispatch({
        type: 'rename',
        id: editingTabId,
        name: normalizeTabName(editingTabName),
      })
    }
    refreshNow()
    handleClose()
  }

  const handleConfirm = () => {
    confirmWith(dateTime)
  }

  // 日時が変更されたとき。設定がオンで、タブ名が変更されていなければ、確定する
  const handleDateTimeChange = (value: string) => {
    setDateTime(value)
    if (
      settings.autoConfirm &&
      value !== '' &&
      editingTab !== undefined &&
      !isEditingTabNameChanged
    ) {
      confirmWith(value)
    }
  }
  // 日時は変更せず、タブ名のみを反映する
  const handleRename = () => {
    if (
      editingTabId === null ||
      !isEditingTabNameValid ||
      !isEditingTabNameChanged
    ) {
      return
    }
    dispatch({
      type: 'rename',
      id: editingTabId,
      name: normalizeTabName(editingTabName),
    })
    handleClose()
  }

  // 確認のうえ、タブを削除する
  const handleDelete = () => {
    if (editingTab === undefined || !canDeleteEditingTab) {
      return
    }
    const message = `「${editingTab.name}」を削除しますか？この操作は取り消せません。`
    if (!window.confirm(message)) {
      return
    }
    dispatch({ type: 'remove', id: editingTab.id })
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
      <main className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="tab-item"
            onClick={() => handleOpen(tab)}
          >
            <span className="tab-item-inner">
              <span className="tab-item-header">
                <span className="tab-item-name">{tab.name}</span>
                {tab.lastReadAt && (
                  <span className="tab-item-elapsed">
                    {formatElapsed(getElapsedMinutes(tab.lastReadAt, now))}
                  </span>
                )}
              </span>
              <span
                className={
                  tab.lastReadAt
                    ? 'tab-item-datetime'
                    : 'tab-item-datetime tab-item-datetime-empty'
                }
              >
                {tab.lastReadAt ? formatDateTime(tab.lastReadAt) : '未記録'}
              </span>
            </span>
          </button>
        ))}

        <button
          type="button"
          className="add-tab-button"
          onClick={handleOpenAdd}
        >
          タブを追加
        </button>
      </main>

      <Modal ref={dialogRef}>
        <h2 className="modal-title">タブの編集</h2>

        <div className="field">
          <label className="field-label" htmlFor="date-time">
            日時
          </label>
          <input
            id="date-time"
            className="text-input datetime-input"
            type="datetime-local"
            value={dateTime}
            onChange={(event) => handleDateTimeChange(event.target.value)}
          />
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={settings.autoConfirm}
              onChange={(event) =>
                setSettings({ ...settings, autoConfirm: event.target.checked })
              }
            />
            <span>日時を選んだら確定する（全タブ共通）</span>
          </label>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="edit-tab-name">
            名前
          </label>
          <input
            id="edit-tab-name"
            className="text-input"
            type="text"
            maxLength={MAX_TAB_NAME_LENGTH}
            value={editingTabName}
            onChange={(event) => setEditingTabName(event.target.value)}
          />
        </div>

        <div className="button-row">
          <button
            type="button"
            className="button button-primary"
            onClick={handleConfirm}
            disabled={!dateTime || !isEditingTabNameValid}
          >
            確定
          </button>
          <button
            type="button"
            className="button"
            onClick={handleRename}
            disabled={!isEditingTabNameValid || !isEditingTabNameChanged}
          >
            名前のみ変更
          </button>
        </div>

        <button
          type="button"
          className="button button-danger"
          onClick={handleDelete}
          disabled={!canDeleteEditingTab}
        >
          タブを削除
        </button>
      </Modal>

      <Modal ref={addDialogRef}>
        <h2 className="modal-title">タブの追加</h2>

        <div className="field">
          <label className="field-label" htmlFor="tab-name">
            名前
          </label>
          <input
            id="tab-name"
            className="text-input"
            type="text"
            maxLength={MAX_TAB_NAME_LENGTH}
            value={tabName}
            onChange={(event) => setTabName(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="button button-primary"
          onClick={handleAdd}
          disabled={!isValidTabName(tabName)}
        >
          追加
        </button>
      </Modal>
    </>
  )
}

export default App
