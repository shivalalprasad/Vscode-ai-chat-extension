export interface Message {
  id: string
  content: string
  sender: "user" | "ai" | "system"
  timestamp: Date
  attachments?: FileAttachmentData[]
}

export interface FileAttachmentData {
  filename: string
  content: string
}
