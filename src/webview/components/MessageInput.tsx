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
  const [filteredFiles, setFilteredFiles] = useState<string[]>([])
  const [selectedFileIndex, setSelectedFileIndex] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Filter files to exclude unwanted ones
  const getFilteredWorkspaceFiles = useCallback(() => {
    return workspaceFiles.filter((file) => {
      const fileName = file.toLowerCase()
      const excludePatterns = [
        "node_modules/",
        ".git/",
        ".vscode/",
        "dist/",
        "build/",
        "out/",
        ".next/",
        "coverage/",
        ".nyc_output/",
        "logs/",
        "*.log",
        "*.lock",
        "package-lock.json",
        "yarn.lock",
        ".env",
        ".env.local",
        ".env.production",
        ".DS_Store",
        "Thumbs.db",
        "*.min.js",
        "*.min.css",
        "*.map",
      ]

      return !excludePatterns.some((pattern) => {
        if (pattern.includes("*")) {
          const regex = new RegExp(pattern.replace(/\*/g, ".*"))
          return regex.test(fileName)
        }
        return fileName.includes(pattern.toLowerCase())
      })
    })
  }, [workspaceFiles])

  // Handle @ symbol for file suggestions
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const handleInput = () => {
      const cursorPosition = textarea.selectionStart
      const textBeforeCursor = message.substring(0, cursorPosition)
      const lastAtIndex = textBeforeCursor.lastIndexOf("@")

      if (lastAtIndex !== -1) {
        const searchTerm = textBeforeCursor.substring(lastAtIndex + 1)
        const hasSpaceAfterAt = searchTerm.includes(" ")

        if (!hasSpaceAfterAt && searchTerm.length >= 0) {
          const filtered = getFilteredWorkspaceFiles()
            .filter((file) => file.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 10)

          setFilteredFiles(filtered)
          setShowSuggestions(filtered.length > 0)
          setSelectedFileIndex(-1)
        } else {
          setShowSuggestions(false)
        }
      } else {
        setShowSuggestions(false)
      }
    }

    handleInput()
  }, [message, getFilteredWorkspaceFiles])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredFiles.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedFileIndex((prev) => (prev < filteredFiles.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedFileIndex((prev) => (prev > 0 ? prev - 1 : filteredFiles.length - 1))
          break
        case "Tab":
        case "Enter":
          if (selectedFileIndex >= 0) {
            e.preventDefault()
            selectFile(filteredFiles[selectedFileIndex])
          }
          break
        case "Escape":
          setShowSuggestions(false)
          setSelectedFileIndex(-1)
          break
      }
    }

    if (e.key === "Enter" && !e.shiftKey && !showSuggestions) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const selectFile = (fileName: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPosition = textarea.selectionStart
    const textBeforeCursor = message.substring(0, cursorPosition)
    const textAfterCursor = message.substring(cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const newMessage = textBeforeCursor.substring(0, lastAtIndex) + `@${fileName} ` + textAfterCursor

      setMessage(newMessage)
      setShowSuggestions(false)
      setSelectedFileIndex(-1)

      // Focus back to textarea
      setTimeout(() => {
        textarea.focus()
        const newCursorPos = lastAtIndex + fileName.length + 2
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }
  }

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
      setShowSuggestions(false)
    }
  }

  // Global handler for file picker
  useEffect(() => {
    const handleFilePickerSelect = (filePath: string) => {
      const cleanPath = filePath.startsWith("./") ? filePath.substring(2) : filePath
      setMessage((prev) => prev + `@${cleanPath} `)
      textareaRef.current?.focus()
    }

    // Make it globally available
    ;(window as any).handleFilePickerSelect = handleFilePickerSelect

    return () => {
      delete (window as any).handleFilePickerSelect
    }
  }, [])

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Glitchy anything... Use @filename to include files"
          disabled={disabled}
          className="message-input"
          rows={3}
        />

        {showSuggestions && (
          <div ref={suggestionsRef} className="file-suggestions">
            {filteredFiles.map((file, index) => (
              <div
                key={file}
                className={`suggestion-item ${index === selectedFileIndex ? "selected" : ""}`}
                onClick={() => selectFile(file)}
              >
                <span className="file-icon">📄</span>
                <span className="file-name">{file}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleSubmit} disabled={disabled || !message.trim()} className="send-button">
          {disabled ? "⏳" : "🚀"}
        </button>
      </div>
    </div>
  )
}
