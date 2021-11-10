import { useRef, useState } from "react"

interface Props {
  children: React.ReactChild
  className?: string
}

const DragToScroll = ({ children, className }: Props): React.ReactElement => {
  const ref = useRef(null)

  const [scrollState, setScrollState] = useState({
    isScrolling: false,
    clientX: 0,
    scrollX: 0,
  })

  const onMouseDown = e => {
    if (!ref.current.contains(e.target)) {
      e.preventDefault()
      setScrollState({ ...scrollState, isScrolling: true, clientX: e.clientX })
    }
  }

  const onMouseUp = () => {
    setScrollState({ ...scrollState, isScrolling: false })
  }

  const onMouseMove = e => {
    e.preventDefault()

    const { clientX, scrollX } = scrollState
    if (scrollState.isScrolling) {
      ref.current.scrollLeft = -(scrollX + e.clientX - clientX)

      setScrollState({
        ...scrollState,
        scrollX: scrollX + e.clientX - clientX,
        clientX: e.clientX,
      })
    }
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      className={className}
    >
      {children}
    </div>
  )
}

export default DragToScroll
