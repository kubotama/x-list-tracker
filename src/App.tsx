import { useRef, useState } from 'react'

const App = () => {
  const [dateTime, setDateTime] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleOpen = () => {
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

  return (
    <>
      <main>
        <button
          type="button"
          onClick={handleOpen}
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
          <div>フォロー中</div>
          <div>未記録</div>
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
        <button type="button" onClick={handleClose}>
          閉じる
        </button>
      </dialog>
    </>
  )
}

export default App
