"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"

interface MessageInputProps {
  onSendMessage: (message: string) => void
  workspaceFiles: string[]
  disabled: boolean
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, workspaceFiles, disabled }) => {
  const [message, setMessage] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [message, adjustTextareaHeight])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      const position = e.target.selectionStart

      setMessage(value)
      setCursorPosition(position)

      const beforeCursor = value.substring(0, position)
      const atMatch = beforeCursor.match(/@(\w*)$/)

      if (atMatch) {
        const query = atMatch[1].toLowerCase()
        const filtered = workspaceFiles.filter((file) => file.toLowerCase().includes(query)).slice(0, 10)
        setSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
      } else {
        setShowSuggestions(false)
      }
    },
    [workspaceFiles],
  )

  const handleSuggestionClick = useCallback(
    (filename: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const value = textarea.value
      const beforeCursor = value.substring(0, cursorPosition)
      const afterCursor = value.substring(cursorPosition)

      const atMatch = beforeCursor.match(/@(\w*)$/)
      if (atMatch) {
        const newValue = beforeCursor.replace(/@(\w*)$/, `@${filename} `) + afterCursor
        setMessage(newValue)
        setShowSuggestions(false)

        setTimeout(() => {
          textarea.focus()
          const newPosition = beforeCursor.replace(/@(\w*)$/, `@${filename} `).length
          textarea.setSelectionRange(newPosition, newPosition)
        }, 0)
      }
    },
    [cursorPosition],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (message.trim() && !disabled) {
        onSendMessage(message.trim())
        setMessage("")
        setShowSuggestions(false)
      }
    },
    [message, disabled, onSendMessage],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    },
    [handleSubmit],
  )

  return (
    <div className="message-input-container">
      {showSuggestions && (
        <div className="suggestions-dropdown">
          {suggestions.map((filename) => (
            <div key={filename} className="suggestion-item" onClick={() => handleSuggestionClick(filename)}>
              📄 {filename}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... Use @filename to attach files, Shift+Enter for new line"
            disabled={disabled}
            rows={1}
          />
        </div>
        <button type="submit" className="send-button" disabled={disabled || !message.trim()}>
          {disabled ? (
            <>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              Sending...
            </>
          ) : (
            <>
              <span>🚀</span>
              Send
            </>
          )}
        </button>
      </form>
    </div>
  )
}
