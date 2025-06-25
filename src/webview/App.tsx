"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
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
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
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
          setIsConnected(true)
          break

        case "error":
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: `❌ Error: ${message.data.message}`,
              sender: "system",
              timestamp: new Date(),
            },
          ])
          setIsLoading(false)
          setIsConnected(false)
          break

        case "currentFileContent":
          const fileContent = `📄 Current ${message.data.isSelection ? "selection" : "file"}: **${message.data.filename}**\n\n\`\`\`\n${message.data.content}\n\`\`\``
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

  const handleSendMessage = useCallback(
    (content: string) => {
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
    },
    [attachedFiles],
  )

  const handleUseCurrentFile = useCallback(() => {
    vscode.postMessage({ type: "getCurrentFile" })
  }, [])

  const handleFileAttach = useCallback(
    (filename: string) => {
      if (!attachedFiles.find((f) => f.filename === filename)) {
        vscode.postMessage({ type: "getFileContent", data: { filename } })
      }
    },
    [attachedFiles],
  )

  const handleRemoveAttachment = useCallback((filename: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.filename !== filename))
  }, [])

  const handleClearChat = useCallback(() => {
    setMessages([])
  }, [])

  const handleExplainCode = useCallback(() => {
    vscode.postMessage({ type: "getCurrentFile" })
    setTimeout(() => {
      handleSendMessage("Please explain this code and suggest improvements.")
    }, 100)
  }, [handleSendMessage])

  const handleFindBugs = useCallback(() => {
    vscode.postMessage({ type: "getCurrentFile" })
    setTimeout(() => {
      handleSendMessage("Please review this code for potential bugs, security issues, and performance problems.")
    }, 100)
  }, [handleSendMessage])

  const handleGenerateTests = useCallback(() => {
    vscode.postMessage({ type: "getCurrentFile" })
    setTimeout(() => {
      handleSendMessage("Please generate comprehensive unit tests for this code.")
    }, 100)
  }, [handleSendMessage])

  const handleOptimizeCode = useCallback(() => {
    vscode.postMessage({ type: "getCurrentFile" })
    setTimeout(() => {
      handleSendMessage("Please optimize this code for better performance and readability.")
    }, 100)
  }, [handleSendMessage])

  const handleAddComments = useCallback(() => {
    vscode.postMessage({ type: "getCurrentFile" })
    setTimeout(() => {
      handleSendMessage("Please add comprehensive comments and documentation to this code.")
    }, 100)
  }, [handleSendMessage])

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <h1>
            🤖 AI Chat Assistant
            <div className={`status-indicator ${isConnected ? "connected" : "disconnected"}`}></div>
          </h1>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={handleUseCurrentFile}>
            📄 Use Current File
          </button>
          <button className="action-btn secondary" onClick={handleClearChat}>
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      <ChatPanel messages={messages} isLoading={isLoading} />

      <div className="input-section">
        {/* Quick Actions */}
        <div className="quick-actions">
          <span className="quick-actions-label">Quick Actions:</span>
          <button className="quick-action-btn" onClick={handleExplainCode}>
            💡 Explain Code
          </button>
          <button className="quick-action-btn" onClick={handleFindBugs}>
            🐛 Find Bugs
          </button>
          <button className="quick-action-btn" onClick={handleGenerateTests}>
            🧪 Generate Tests
          </button>
          <button className="quick-action-btn" onClick={handleOptimizeCode}>
            ⚡ Optimize
          </button>
          <button className="quick-action-btn" onClick={handleAddComments}>
            📝 Add Comments
          </button>
        </div>

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
