"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"

interface MessageInputProps {
  onSendMessage: (message: string) => void
  workspaceFiles: string[]
  disabled: boolean
  selectedFiles: string[]
  onFileSelect: (files: string[]) => void
  onShowFilePicker: () => void
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  workspaceFiles,
  disabled,
  selectedFiles,
  onFileSelect,
  onShowFilePicker,
}) => {
  const [message, setMessage] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync selected files with input text
  useEffect(() => {
    const currentFiles = extractFilesFromMessage(message)
    if (JSON.stringify(currentFiles.sort()) !== JSON.stringify(selectedFiles.sort())) {
      onFileSelect(currentFiles)
    }
  }, [message, selectedFiles, onFileSelect])

  // Extract @file references from message
  const extractFilesFromMessage = (text: string): string[] => {
    const fileMatches = text.match(/@([^\s]+)/g)
    return fileMatches ? fileMatches.map((match) => match.substring(1)) : []
  }

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

        // Filter out unwanted files and directories
        const filtered = workspaceFiles
          .filter((file) => {
            // Ignore common unwanted files and directories
            const unwantedPatterns = [
              "node_modules/",
              ".git/",
              ".vscode/",
              "out/",
              "dist/",
              "build/",
              ".next/",
              ".nuxt/",
              "coverage/",
              ".nyc_output/",
              ".DS_Store",
              "Thumbs.db",
              "*.log",
              "*.lock",
              "*.map",
              "*.min.js",
              "*.min.css",
              "package-lock.json",
              "yarn.lock",
              ".env",
              ".env.local",
              ".env.production",
              ".env.development",
            ]

            // Check if file matches any unwanted pattern
            const isUnwanted = unwantedPatterns.some((pattern) => {
              if (pattern.includes("*")) {
                const regex = new RegExp(pattern.replace(/\*/g, ".*"))
                return regex.test(file.toLowerCase())
              }
              return file.toLowerCase().includes(pattern.toLowerCase())
            })

            if (isUnwanted) return false

            // Only include files that match the query
            return file.toLowerCase().includes(query)
          })
          .slice(0, 10)

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

  const handleFilePickerSelect = useCallback(
    (filePath: string) => {
      const relativePath = filePath.startsWith("./") ? filePath.substring(2) : filePath
      const currentMessage = message
      const newMessage = currentMessage + (currentMessage ? " " : "") + `@${relativePath} `
      setMessage(newMessage)

      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    },
    [message],
  )

  // Expose the handler for parent component
  useEffect(() => {
    ;(window as any).handleFilePickerSelect = handleFilePickerSelect
  }, [handleFilePickerSelect])

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

      <div className="file-selector-section">
        <button type="button" className="file-selector-button" onClick={onShowFilePicker} disabled={disabled}>
          📁 Browse Files
        </button>
        {selectedFiles.length > 0 && (
          <div className="selected-files-preview">
            {selectedFiles.map((file) => (
              <span key={file} className="selected-file-tag">
                📄 {file}
              </span>
            ))}
          </div>
        )}
      </div>

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
