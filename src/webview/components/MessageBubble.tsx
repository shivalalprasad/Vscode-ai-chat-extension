import type React from "react"
import { marked } from "marked"
import hljs from "highlight.js"
import type { Message } from "../types"

interface MessageBubbleProps {
  message: Message
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const formatContent = (content: string) => {
    const renderer = new marked.Renderer()

    renderer.code = (code: string, language?: string) => {
      if (language && hljs.getLanguage(language)) {
        try {
          const highlighted = hljs.highlight(code, { language }).value
          return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
        } catch (err) {
          console.error("Highlight error:", err)
        }
      }
      const highlighted = hljs.highlightAuto(code).value
      return `<pre><code class="hljs">${highlighted}</code></pre>`
    }

    return marked(content, { renderer })
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
    </div>
  )
}
