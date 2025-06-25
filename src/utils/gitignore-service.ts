import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs"

export class GitignoreService {
  private gitignorePatterns: string[] = []
  private workspaceRoot: string | undefined

  constructor() {
    this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    this.loadGitignore()
  }

  private async loadGitignore() {
    if (!this.workspaceRoot) return

    const gitignorePath = path.join(this.workspaceRoot, ".gitignore")

    try {
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, "utf8")
        this.gitignorePatterns = gitignoreContent
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("#"))
          .map((pattern) => {
            // Convert gitignore patterns to glob patterns
            if (pattern.endsWith("/")) {
              return pattern + "**"
            }
            return pattern
          })
      }

      // Add common patterns that should always be ignored
      this.gitignorePatterns.push(
        "node_modules/**",
        ".git/**",
        ".vscode/**",
        "out/**",
        "dist/**",
        "build/**",
        ".next/**",
        ".nuxt/**",
        "coverage/**",
        ".nyc_output/**",
        "*.log",
        "*.lock",
        ".DS_Store",
        "Thumbs.db",
        "*.vsix",
        "*.map",
      )
    } catch (error) {
      console.error("Error loading .gitignore:", error)
    }
  }

  public isIgnored(filePath: string): boolean {
    if (!this.workspaceRoot) return false

    const relativePath = path.relative(this.workspaceRoot, filePath)

    return this.gitignorePatterns.some((pattern) => {
      return this.matchPattern(relativePath, pattern)
    })
  }

  private matchPattern(filePath: string, pattern: string): boolean {
    // Simple glob pattern matching
    const regexPattern = pattern
      .replace(/\./g, "\\.")
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")
      .replace(/\?/g, "[^/]")

    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(filePath) || regex.test(path.dirname(filePath))
  }

  public getIgnorePatterns(): string[] {
    return [...this.gitignorePatterns]
  }
}
