"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

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

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const handleInput = () => {
      const value = textarea.value
      const position = textarea.selectionStart
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
    }

    textarea.addEventListener("input", handleInput)
    return () => textarea.removeEventListener("input", handleInput)
  }, [workspaceFiles])

  const handleSuggestionClick = (filename: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const value = textarea.value
    const beforeCursor = value.substring(0, cursorPosition)
    const afterCursor = value.substring(cursorPosition)

    const atMatch = beforeCursor.match(/@(\w*)$/)
    if (atMatch) {
      const newValue = beforeCursor.replace(/@(\w*)$/, `@${filename}`) + afterCursor
      setMessage(newValue)
      setShowSuggestions(false)

      setTimeout(() => {
        textarea.focus()
        const newPosition = beforeCursor.replace(/@(\w*)$/, `@${filename}`).length
        textarea.setSelectionRange(newPosition, newPosition)
      }, 0)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message)
      setMessage("")
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

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
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... Use @filename to attach files"
          disabled={disabled}
          rows={3}
        />
        <button type="submit" disabled={disabled || !message.trim()}>
          {disabled ? "⏳" : "📤"} Send
        </button>
      </form>
    </div>
  )
}
