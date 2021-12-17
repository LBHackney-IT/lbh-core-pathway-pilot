import { useRef, useState } from "react"

interface Props {
  children: React.ReactChild
  className?: string
}

const DragToScroll = ({ children, className }: Props): React.ReactElement => {
  const ref = useRef(null)

  const [isScrolling, setIsScrolling] = useState<boolean>(false)
  const [lastPos, setLastPos] = useState<{
    clientX: number
    scrollLeft: number
  }>({
    clientX: 0,
    scrollLeft: 0,
  })

  const onMouseDown = e => {
    // only allow dragging on negative space in the ui
    if (e.target.dataset.draggable) {
      e.preventDefault()
      setIsScrolling(true)
      setLastPos({
        clientX: e.clientX,
        scrollLeft: ref.current.scrollLeft,
      })
      e.target.style.cursor = "grabbing"
    }
  }

  const onMouseUp = e => {
    if (isScrolling) {
      setIsScrolling(false)
      setLastPos({
        clientX: 0,
        scrollLeft: 0,
      })
    }
    e.target.style.cursor = ""
  }

  const onMouseMove = e => {
    if (isScrolling) {
      const { clientX, scrollLeft } = lastPos
      ref.current.scrollLeft = scrollLeft + clientX - e.clientX
    }
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onMouseMove={onMouseMove}
      className={className}
      data-draggable={true}
    >
      {children}
    </div>
  )
}

export default DragToScroll
