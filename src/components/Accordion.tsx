import { ReactNode, memo, useCallback, useState } from "react"
import { IoCaretForward as Closed, IoCaretDown as Open } from 'react-icons/io5'
import cx from 'classnames'
import './Accordion.css'

type Props = {
  title: string
  children: ReactNode
}

export const Accordion = memo<Props>(({ title, children }) => {

  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen])

  return <div className={cx('Accordion', { ['is-open']: isOpen })} onClick={toggle}>
    <h3 className="title">{isOpen ? <Open /> : <Closed />} {title}</h3>
    <div className="children">{children}</div>
  </div>
})