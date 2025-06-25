import * as vscode from "vscode"
import * as path from "path"
import { GitignoreService } from "./gitignore-service"

export interface FileInfo {
  name: string
  path: string
  relativePath: string
  type: "file" | "directory"
  extension?: string
  size?: number
  lastModified?: Date
}

export class FileService {
  private gitignoreService: GitignoreService

  constructor() {
    this.gitignoreService = new GitignoreService()
  }

  async getFileContent(filename: string): Promise<string | null> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders) return null

      for (const folder of workspaceFolders) {
        const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, `**/${filename}`), null, 1)

        if (files.length > 0) {
          const document = await vscode.workspace.openTextDocument(files[0])
          return document.getText()
        }
      }
      return null
    } catch (error) {
      console.error("Error reading file:", error)
      return null
    }
  }

  async getWorkspaceFiles(): Promise<string[]> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders) return []

      const files: string[] = []
      for (const folder of workspaceFolders) {
        const foundFiles = await vscode.workspace.findFiles(
          new vscode.RelativePattern(folder, "**/*"),
          "**/node_modules/**",
          500,
        )

        foundFiles.forEach((file) => {
          const relativePath = vscode.workspace.asRelativePath(file)

          // Filter out ignored files
          if (!this.gitignoreService.isIgnored(file.fsPath)) {
            files.push(relativePath)
          }
        })
      }

      return files.sort()
    } catch (error) {
      console.error("Error getting workspace files:", error)
      return []
    }
  }

  async getFilteredWorkspaceFiles(extensions?: string[]): Promise<FileInfo[]> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders) return []

      const files: FileInfo[] = []

      for (const folder of workspaceFolders) {
        const foundFiles = await vscode.workspace.findFiles(
          new vscode.RelativePattern(folder, "**/*"),
          "**/node_modules/**",
          1000,
        )

        for (const file of foundFiles) {
          const relativePath = vscode.workspace.asRelativePath(file)

          // Skip ignored files
          if (this.gitignoreService.isIgnored(file.fsPath)) {
            continue
          }

          const stat = await vscode.workspace.fs.stat(file)
          const extension = path.extname(file.fsPath).toLowerCase()

          // Filter by extensions if provided
          if (extensions && extensions.length > 0) {
            if (!extensions.includes(extension)) {
              continue
            }
          }

          // Only include actual files, not directories
          if (stat.type === vscode.FileType.File) {
            files.push({
              name: path.basename(file.fsPath),
              path: file.fsPath,
              relativePath,
              type: "file",
              extension: extension || undefined,
              size: stat.size,
              lastModified: new Date(stat.mtime),
            })
          }
        }
      }

      // Sort by relevance: code files first, then by name
      return files.sort((a, b) => {
        const codeExtensions = [
          ".ts",
          ".tsx",
          ".js",
          ".jsx",
          ".py",
          ".java",
          ".cpp",
          ".c",
          ".cs",
          ".php",
          ".rb",
          ".go",
          ".rs",
          ".swift",
        ]
        const aIsCode = codeExtensions.includes(a.extension || "")
        const bIsCode = codeExtensions.includes(b.extension || "")

        if (aIsCode && !bIsCode) return -1
        if (!aIsCode && bIsCode) return 1

        return a.name.localeCompare(b.name)
      })
    } catch (error) {
      console.error("Error getting filtered workspace files:", error)
      return []
    }
  }

  async getCurrentFileInfo(): Promise<FileInfo | null> {
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) return null

    const document = activeEditor.document
    const stat = await vscode.workspace.fs.stat(document.uri)

    return {
      name: path.basename(document.fileName),
      path: document.fileName,
      relativePath: vscode.workspace.asRelativePath(document.uri),
      type: "file",
      extension: path.extname(document.fileName).toLowerCase(),
      size: stat.size,
      lastModified: new Date(stat.mtime),
    }
  }

  getCodeFileExtensions(): string[] {
    return [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".py",
      ".pyx",
      ".pyi",
      ".java",
      ".kt",
      ".scala",
      ".cpp",
      ".cc",
      ".cxx",
      ".c",
      ".h",
      ".hpp",
      ".cs",
      ".vb",
      ".php",
      ".phtml",
      ".rb",
      ".rake",
      ".go",
      ".mod",
      ".rs",
      ".swift",
      ".dart",
      ".vue",
      ".svelte",
      ".html",
      ".htm",
      ".xml",
      ".css",
      ".scss",
      ".sass",
      ".less",
      ".json",
      ".yaml",
      ".yml",
      ".toml",
      ".md",
      ".mdx",
      ".sql",
      ".sh",
      ".bash",
      ".zsh",
      ".fish",
      ".dockerfile",
      ".dockerignore",
      ".gitignore",
      ".gitattributes",
    ]
  }
}
