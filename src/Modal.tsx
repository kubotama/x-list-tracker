import type { ComponentProps } from 'react'

type ModalProps = Omit<ComponentProps<'dialog'>, 'onClick'>

// 外側（ダイアログ自身）をクリックしたときに閉じる、共通のダイアログ
export const Modal = ({ children, ...props }: ModalProps) => (
  <dialog
    {...props}
    onClick={(event) => {
      if (event.target === event.currentTarget) {
        event.currentTarget.close()
      }
    }}
  >
    <div className="modal-body">{children}</div>
  </dialog>
)
