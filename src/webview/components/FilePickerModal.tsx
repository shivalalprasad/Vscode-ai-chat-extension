"use client"

import type React from "react"
import { useState, useMemo } from "react"
import type { FileInfo } from "../../utils/file-service"

interface FilePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectFile: (file: FileInfo) => void
  files: FileInfo[]
  title: string
  description?: string
}

export const FilePickerModal: React.FC<FilePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  files,
  title,
  description,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([])

  const extensions = useMemo(() => {
    const exts = new Set<string>()
    files.forEach((file) => {
      if (file.extension) {
        exts.add(file.extension)
      }
    })
    return Array.from(exts).sort()
  }, [files])

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch =
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.relativePath.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesExtension =
        selectedExtensions.length === 0 || (file.extension && selectedExtensions.includes(file.extension))

      return matchesSearch && matchesExtension
    })
  }, [files, searchTerm, selectedExtensions])

  const handleExtensionToggle = (ext: string) => {
    setSelectedExtensions((prev) => (prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]))
  }

  const getFileIcon = (file: FileInfo) => {
    if (!file.extension) return "📄"

    const iconMap: Record<string, string> = {
      ".ts": "🟦",
      ".tsx": "🟦",
      ".js": "🟨",
      ".jsx": "🟨",
      ".py": "🐍",
      ".pyx": "🐍",
      ".pyi": "🐍",
      ".java": "☕",
      ".kt": "🟣",
      ".scala": "🔴",
      ".cpp": "🔵",
      ".c": "🔵",
      ".h": "🔵",
      ".cs": "🟢",
      ".vb": "🟢",
      ".php": "🟣",
      ".rb": "💎",
      ".go": "🐹",
      ".rs": "🦀",
      ".swift": "🧡",
      ".dart": "🎯",
      ".vue": "💚",
      ".svelte": "🧡",
      ".html": "🌐",
      ".css": "🎨",
      ".json": "📋",
      ".yaml": "📋",
      ".yml": "📋",
      ".md": "📝",
      ".txt": "📄",
      ".sql": "🗄️",
      ".db": "🗄️",
      ".sh": "⚡",
      ".bash": "⚡",
      ".dockerfile": "🐳",
      ".gitignore": "🚫",
    }

    return iconMap[file.extension] || "📄"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!isOpen) return null

  return (
    <div className="file-picker-overlay">
      <div className="file-picker-modal">
        <div className="file-picker-header">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="file-picker-filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="extension-filters">
            <span className="filter-label">File types:</span>
            <div className="extension-tags">
              {extensions.slice(0, 10).map((ext) => (
                <button
                  key={ext}
                  className={`extension-tag ${selectedExtensions.includes(ext) ? "selected" : ""}`}
                  onClick={() => handleExtensionToggle(ext)}
                >
                  {ext}
                </button>
              ))}
              {selectedExtensions.length > 0 && (
                <button className="clear-filters" onClick={() => setSelectedExtensions([])}>
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="file-list">
          {filteredFiles.length === 0 ? (
            <div className="no-files">
              <p>No files found matching your criteria</p>
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div key={file.path} className="file-item" onClick={() => onSelectFile(file)}>
                <div className="file-icon">{getFileIcon(file)}</div>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-path">{file.relativePath}</div>
                </div>
                <div className="file-meta">
                  {file.size && <span className="file-size">{formatFileSize(file.size)}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="file-picker-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
