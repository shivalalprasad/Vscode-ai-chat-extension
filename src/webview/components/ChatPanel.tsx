"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { FilePickerModal } from "./FilePickerModal"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  attachedFiles?: string[]
}

interface ChatPanelProps {
  vscode: any
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ vscode }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [workspaceFiles, setWorkspaceFiles] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showFilePicker, setShowFilePicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    // Request workspace files on mount
    vscode.postMessage({ type: "getWorkspaceFiles" })

    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      switch (message.type) {
        case "aiResponse":
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: message.data.message,
              isUser: false,
              timestamp: new Date(),
            },
          ])
          setIsLoading(false)
          break
        case "error":
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: `❌ Error: ${message.data.message}`,
              isUser: false,
              timestamp: new Date(),
            },
          ])
          setIsLoading(false)
          break
        case "workspaceFiles":
          setWorkspaceFiles(message.data.files)
          break
        case "fileContent":
          // Handle file content if needed
          break
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [vscode])

  const handleSendMessage = useCallback(
    (messageText: string) => {
      // Extract file references from message
      const fileMatches = messageText.match(/@([^\s]+)/g)
      const attachedFiles = fileMatches ? fileMatches.map((match) => match.substring(1)) : []

      // Clean message text (remove @file references for display)
      const cleanMessage = messageText.replace(/@([^\s]+)/g, "").trim()

      const userMessage: Message = {
        id: Date.now().toString(),
        content: cleanMessage || messageText,
        isUser: true,
        timestamp: new Date(),
        attachedFiles: attachedFiles.length > 0 ? attachedFiles : undefined,
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      vscode.postMessage({
        type: "sendMessage",
        data: {
          message: cleanMessage || messageText,
          attachedFiles,
        },
      })

      // Clear selected files after sending
      setSelectedFiles([])
    },
    [vscode],
  )

  const handleFileSelect = useCallback((files: string[]) => {
    setSelectedFiles(files)
  }, [])

  const handleShowFilePicker = useCallback(() => {
    setShowFilePicker(true)
  }, [])

  const handleFilePickerSelect = useCallback((filePath: string) => {
    setShowFilePicker(false)
    // Call the global handler to add file to input
    if ((window as any).handleFilePickerSelect) {
      ;(window as any).handleFilePickerSelect(filePath)
    }
  }, [])

  const handleFilePickerClose = useCallback(() => {
    setShowFilePicker(false)
  }, [])

  return (
    <div className="chat-panel">
      <div className="messages-container">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="loading-message">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Glitchy is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        workspaceFiles={workspaceFiles}
        disabled={isLoading}
        selectedFiles={selectedFiles}
        onFileSelect={handleFileSelect}
        onShowFilePicker={handleShowFilePicker}
      />

      {showFilePicker && (
        <FilePickerModal
          files={workspaceFiles}
          onSelectFile={handleFilePickerSelect}
          onClose={handleFilePickerClose}
          selectedFiles={selectedFiles}
        />
      )}
    </div>
  )
}
