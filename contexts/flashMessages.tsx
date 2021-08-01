import { useRouter } from "next/router"
import React, { useContext, createContext, useState, useEffect } from "react"
import PageAnnouncement from "../components/PageAnnouncement"

interface Message {
  title: string
  type: "success" | "info" | "warning"
  details?: string
}

interface ContextType {
  messages: Message[]
  addMessage: (newMessage: Message) => void
  clearMessages: () => void
}

const FlashMessageContext = createContext<ContextType>(null)

export const FlashMessageProvider = ({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement => {
  const [messages, setMessages] = useState<Message[]>([])

  const router = useRouter()

  const addMessage = newMessage => setMessages(messages.concat(newMessage))
  const clearMessages = () => setMessages([])

  useEffect(() => {
    router.events.on("routeChangeComplete", clearMessages)
    return () => {
      router.events.off("routeChangeComplete", clearMessages)
    }
  }, [])

  return (
    <FlashMessageContext.Provider
      value={{ messages, addMessage, clearMessages }}
    >
      {children}
    </FlashMessageContext.Provider>
  )
}

export const FlashMessages = (): React.ReactElement | null => {
  const { messages } = useContext(FlashMessageContext)

  if (messages.length > 0)
    return (
      <div>
        {messages.map((message, i) => (
          <PageAnnouncement
            key={`${message.title}-${i}`}
            title={message.title}
            className={
              message.type === "warning"
                ? "lbh-page-announcement--warning"
                : message.type === "info"
                ? "lbh-page-announcement--info"
                : ""
            }
          >
            {message.details}
          </PageAnnouncement>
        ))}
      </div>
    )

  return null
}

export default FlashMessageContext

export const useFlashMessages = (): ContextType =>
  useContext(FlashMessageContext)
