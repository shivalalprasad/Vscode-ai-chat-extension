"use client"

import type React from "react"
import type { FileAttachmentData } from "../types"

interface FileAttachmentProps {
  attachedFiles: FileAttachmentData[]
  workspaceFiles: string[]
  onFileAttach: (filename: string) => void
  onRemoveAttachment: (filename: string) => void
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  attachedFiles,
  workspaceFiles,
  onFileAttach,
  onRemoveAttachment,
}) => {
  if (attachedFiles.length === 0) {
    return null
  }

  return (
    <div className="file-attachments">
      <div className="attachments-header">
        <span>📎 Attached Files:</span>
      </div>
      <div className="attachments-list">
        {attachedFiles.map((file) => (
          <div key={file.filename} className="attachment-item">
            <span className="attachment-name">📄 {file.filename}</span>
            <button
              className="remove-attachment"
              onClick={() => onRemoveAttachment(file.filename)}
              title="Remove attachment"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
