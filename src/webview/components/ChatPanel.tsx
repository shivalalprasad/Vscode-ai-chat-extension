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
  }, [messages])

  return (
    <div className="chat-panel">
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Welcome to AI Chat Assistant! 👋</h2>
            <p>Start a conversation with your AI assistant.</p>
          </div>
        )}

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
            <span>AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
