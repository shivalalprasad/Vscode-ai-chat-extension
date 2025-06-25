"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { ChatPanel } from "./components/ChatPanel"
import { MessageInput } from "./components/MessageInput"
import { FileAttachment } from "./components/FileAttachment"
import { FilePickerModal } from "./components/FilePickerModal"
import type { Message, FileAttachmentData } from "./types"

declare global {
  interface Window {
    acquireVsCodeApi(): any
  }
}

const vscode = window.acquireVsCodeApi()

interface FileInfo {
  name: string
  path: string
  relativePath: string
  type: "file" | "directory"
  extension?: string
  size?: number
  lastModified?: Date
}

export const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<FileAttachmentData[]>([])
  const [workspaceFiles, setWorkspaceFiles] = useState<string[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileInfo[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [showFilePicker, setShowFilePicker] = useState(false)
  const [filePickerAction, setFilePickerAction] = useState<string>("")
  const [currentFileInfo, setCurrentFileInfo] = useState<FileInfo | null>(null)

  useEffect(() => {
    vscode.postMessage({ type: "getWorkspaceFiles" })
    vscode.postMessage({ type: "getCurrentFileInfo" })
    vscode.postMessage({ type: "getFilteredFiles" })

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
          const fileContent = `📄 Current ${message.data.isSelection ? "selection" : "file"}: **${message.data.filename}**\n\n\`\`\`${message.data.language || ""}\n${message.data.content}\n\`\`\``
          handleSendMessage(fileContent)
          break

        case "selectedFileContent":
          const selectedContent = `📄 Selected file: **${message.data.filename}**\n\n\`\`\`${message.data.language || ""}\n${message.data.content}\n\`\`\``

          // Add the action-specific prompt
          let actionPrompt = ""
          switch (filePickerAction) {
            case "explain":
              actionPrompt = "Please explain this code and suggest improvements."
              break
            case "findBugs":
              actionPrompt = "Please review this code for potential bugs, security issues, and performance problems."
              break
            case "generateTests":
              actionPrompt = "Please generate comprehensive unit tests for this code."
              break
            case "optimize":
              actionPrompt = "Please optimize this code for better performance and readability."
              break
            case "addComments":
              actionPrompt = "Please add comprehensive comments and documentation to this code."
              break
          }

          handleSendMessage(`${selectedContent}\n\n${actionPrompt}`)
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

        case "filteredFiles":
          setFilteredFiles(message.data.files)
          break

        case "currentFileInfo":
          setCurrentFileInfo(message.data.fileInfo)
          break

        case "showFilePicker":
          setFilePickerAction(message.data.action)
          setShowFilePicker(true)
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

  const handleQuickAction = useCallback((action: string) => {
    vscode.postMessage({ type: "quickAction", data: { action } })
  }, [])

  const handleFileSelect = useCallback(
    (file: FileInfo) => {
      setShowFilePicker(false)
      vscode.postMessage({
        type: "selectFile",
        data: {
          filePath: file.relativePath,
          action: filePickerAction,
        },
      })
    },
    [filePickerAction],
  )

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <h1>
            Glitchy 🤌<div className={`status-indicator ${isConnected ? "connected" : "disconnected"}`}></div>
          </h1>
          {currentFileInfo && <span className="current-file-indicator">📄 {currentFileInfo.name}</span>}
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

      {messages.length === 0 && (
        <div className="welcome-message">
          <h2>Welcome to Glitchy 🤌! 👋</h2>
          <p>Your mischievous AI coding companion powered by Google Gemini</p>

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

      <div className="input-section">
        {/* Quick Actions */}
        <div className="quick-actions">
          <span className="quick-actions-label">Quick Actions:</span>
          <button className="quick-action-btn" onClick={() => handleQuickAction("explain")}>
            💡 Explain Code
          </button>
          <button className="quick-action-btn" onClick={() => handleQuickAction("findBugs")}>
            🐛 Find Bugs
          </button>
          <button className="quick-action-btn" onClick={() => handleQuickAction("generateTests")}>
            🧪 Generate Tests
          </button>
          <button className="quick-action-btn" onClick={() => handleQuickAction("optimize")}>
            ⚡ Optimize
          </button>
          <button className="quick-action-btn" onClick={() => handleQuickAction("addComments")}>
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

      <FilePickerModal
        isOpen={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onSelectFile={handleFileSelect}
        files={filteredFiles}
        title="Select a file to analyze"
        description="Choose a code file from your workspace to perform the selected action."
      />
    </div>
  )
}
