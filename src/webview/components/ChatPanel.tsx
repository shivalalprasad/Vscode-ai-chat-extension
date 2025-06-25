"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { MessageBubble } from "./MessageBubble"
import type { Message } from "../types"

interface ChatPanelProps {
  messages: Message[]
  isLoading: boolean
  onApplyToFile: (filename: string, content: string) => void
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, onApplyToFile }) => {
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
            <p>Start a conversation with your AI assistant. You can:</p>
            <ul>
              <li>Ask questions about your code</li>
              <li>Attach files using @filename syntax</li>
              <li>Use the "Use Current File" button to include your active editor content</li>
              <li>Apply AI-generated code directly to your files</li>
            </ul>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onApplyToFile={onApplyToFile} />
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
