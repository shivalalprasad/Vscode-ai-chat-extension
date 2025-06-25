"use client"

import type React from "react"
import { marked } from "marked"
import hljs from "highlight.js"
import type { Message } from "../types"

interface MessageBubbleProps {
  message: Message
  onApplyToFile: (filename: string, content: string) => void
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onApplyToFile }) => {
  const formatContent = (content: string) => {
    // Configure marked with highlight.js
    marked.setOptions({
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value
          } catch (err) {
            console.error("Highlight error:", err)
          }
        }
        return hljs.highlightAuto(code).value
      },
    })

    return marked(content)
  }

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const matches = []
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      matches.push({
        language: match[1] || "text",
        code: match[2].trim(),
        fullMatch: match[0],
      })
    }

    return matches
  }

  const renderApplyButtons = (content: string) => {
    const codeBlocks = extractCodeBlocks(content)

    return codeBlocks
      .map((block, index) => {
        // Try to detect filename from context
        const lines = content.split("\n")
        const blockIndex = content.indexOf(block.fullMatch)
        const beforeBlock = content.substring(0, blockIndex)
        const filenameMatch = beforeBlock.match(/@(\w+\.\w+)|(\w+\.\w+)/g)

        if (filenameMatch) {
          const filename = filenameMatch[filenameMatch.length - 1].replace("@", "")

          return (
            <button
              key={index}
              className="apply-button"
              onClick={() => onApplyToFile(filename, block.code)}
              title={`Apply code to ${filename}`}
            >
              💾 Apply to {filename}
            </button>
          )
        }

        return null
      })
      .filter(Boolean)
  }

  return (
    <div className={`message-bubble ${message.sender}`}>
      <div className="message-header">
        <span className="sender-name">
          {message.sender === "user" ? "👤 You" : message.sender === "ai" ? "🤖 AI Assistant" : "⚠️ System"}
        </span>
        <span className="timestamp">{message.timestamp.toLocaleTimeString()}</span>
      </div>

      {message.attachments && message.attachments.length > 0 && (
        <div className="attachments">
          <strong>Attached files:</strong>
          {message.attachments.map((attachment) => (
            <span key={attachment.filename} className="attachment-tag">
              📎 {attachment.filename}
            </span>
          ))}
        </div>
      )}

      <div className="message-content" dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />

      {message.sender === "ai" && <div className="message-actions">{renderApplyButtons(message.content)}</div>}
    </div>
  )
}
