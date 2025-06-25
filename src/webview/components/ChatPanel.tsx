"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { MessageBubble } from "./MessageBubble"
import type { Message } from "../types"

interface ChatPanelProps {
  messages: Message[]
  isLoading: boolean
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  return (
    <div className="chat-panel">
      <div className="messages-container">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Glitchy 🤌 is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
