"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChatPanel } from "./components/ChatPanel"
import { MessageInput } from "./components/MessageInput"
import { FileAttachment } from "./components/FileAttachment"
import type { Message, FileAttachmentData } from "./types"

declare global {
  interface Window {
    acquireVsCodeApi(): any
  }
}

const vscode = window.acquireVsCodeApi()

export const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<FileAttachmentData[]>([])
  const [workspaceFiles, setWorkspaceFiles] = useState<string[]>([])

  useEffect(() => {
    // Request workspace files on load
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
              sender: "ai",
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
              content: `Error: ${message.data.message}`,
              sender: "system",
              timestamp: new Date(),
            },
          ])
          setIsLoading(false)
          break

        case "currentFileContent":
          const fileContent = `Current ${message.data.isSelection ? "selection" : "file"}: ${message.data.filename}\n\`\`\`\n${message.data.content}\n\`\`\``
          handleSendMessage(fileContent)
          break

        case "fileContent":
          if (message.data.content) {
            setAttachedFiles((prev) => [
              ...prev,
              {
                filename: message.data.filename,
                content: message.data.content,
              },
            ])
          }
          break

        case "workspaceFiles":
          setWorkspaceFiles(message.data.files)
          break
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const handleSendMessage = (content: string) => {
    if (!content.trim() && attachedFiles.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    vscode.postMessage({
      type: "sendMessage",
      data: {
        message: content,
        attachedFiles: attachedFiles.map((f) => f.filename),
      },
    })

    setAttachedFiles([])
  }

  const handleUseCurrentFile = () => {
    vscode.postMessage({ type: "getCurrentFile" })
  }

  const handleFileAttach = (filename: string) => {
    if (!attachedFiles.find((f) => f.filename === filename)) {
      vscode.postMessage({ type: "getFileContent", data: { filename } })
    }
  }

  const handleRemoveAttachment = (filename: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.filename !== filename))
  }

  const handleApplyToFile = (filename: string, content: string) => {
    vscode.postMessage({
      type: "applyToFile",
      data: { filename, content },
    })
  }

  return (
    <div className="app">
      <div className="header">
        <h1>AI Chat Assistant</h1>
        <button className="current-file-btn" onClick={handleUseCurrentFile} title="Use current file or selection">
          📄 Use Current File
        </button>
      </div>

      <ChatPanel messages={messages} isLoading={isLoading} onApplyToFile={handleApplyToFile} />

      <div className="input-section">
        <FileAttachment
          attachedFiles={attachedFiles}
          workspaceFiles={workspaceFiles}
          onFileAttach={handleFileAttach}
          onRemoveAttachment={handleRemoveAttachment}
        />

        <MessageInput onSendMessage={handleSendMessage} workspaceFiles={workspaceFiles} disabled={isLoading} />
      </div>
    </div>
  )
}
