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
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Welcome to AI Chat Assistant! 👋</h2>
            <p>Your intelligent coding companion powered by Google Gemini</p>

            <div className="welcome-features">
              <div className="feature-card">
                <h3>📄 File Context</h3>
                <p>Use @filename or "Use Current File" to include code context in your conversations</p>
              </div>
              <div className="feature-card">
                <h3>🚀 Quick Actions</h3>
                <p>Explain code, find bugs, generate tests, and optimize performance with one click</p>
              </div>
              <div className="feature-card">
                <h3>💡 Smart Suggestions</h3>
                <p>Get intelligent code suggestions, best practices, and architectural advice</p>
              </div>
              <div className="feature-card">
                <h3>🔧 Code Generation</h3>
                <p>Generate boilerplate code, documentation, and comprehensive test suites</p>
              </div>
            </div>
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
            <span>🤖 AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
