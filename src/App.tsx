import { useRef, useState } from 'react'

const formatDateTime = (value: string) =>
  Temporal.PlainDateTime.from(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

const App = () => {
  const [dateTime, setDateTime] = useState('')
  const [confirmedDateTime, setConfirmedDateTime] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleOpen = () => {
    setDateTime(
      confirmedDateTime ||
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
    setConfirmedDateTime(dateTime)
    handleClose()
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
          <div>
            {confirmedDateTime ? formatDateTime(confirmedDateTime) : '未記録'}
          </div>
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
    </>
  )
}

export default App
