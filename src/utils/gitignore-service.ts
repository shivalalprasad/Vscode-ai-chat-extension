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

      // Add comprehensive patterns that should always be ignored
      this.gitignorePatterns.push(
        // Dependencies
        "node_modules/**",
        "bower_components/**",
        "jspm_packages/**",

        // Build outputs
        "out/**",
        "dist/**",
        "build/**",
        "target/**",
        "bin/**",
        "obj/**",

        // Framework specific
        ".next/**",
        ".nuxt/**",
        ".vuepress/dist/**",
        ".docusaurus/**",

        // Version control
        ".git/**",
        ".svn/**",
        ".hg/**",

        // IDE/Editor
        ".vscode/**",
        ".idea/**",
        "*.swp",
        "*.swo",
        "*~",

        // OS generated
        ".DS_Store",
        ".DS_Store?",
        "._*",
        ".Spotlight-V100",
        ".Trashes",
        "ehthumbs.db",
        "Thumbs.db",

        // Logs
        "*.log",
        "logs/**",
        "npm-debug.log*",
        "yarn-debug.log*",
        "yarn-error.log*",

        // Runtime data
        "pids/**",
        "*.pid",
        "*.seed",
        "*.pid.lock",

        // Coverage directory used by tools like istanbul
        "coverage/**",
        ".nyc_output/**",

        // Dependency directories
        "node_modules/**",
        "jspm_packages/**",

        // Optional npm cache directory
        ".npm/**",

        // Optional eslint cache
        ".eslintcache",

        // Microbundle cache
        ".rpt2_cache/",
        ".rts2_cache_cjs/",
        ".rts2_cache_es/",
        ".rts2_cache_umd/",

        // Optional REPL history
        ".node_repl_history",

        // Output of 'npm pack'
        "*.tgz",

        // Yarn Integrity file
        ".yarn-integrity",

        // dotenv environment variables file
        ".env",
        ".env.local",
        ".env.development.local",
        ".env.test.local",
        ".env.production.local",

        // parcel-bundler cache
        ".cache",
        ".parcel-cache",

        // next.js build output
        ".next",

        // nuxt.js build output
        ".nuxt",

        // vuepress build output
        ".vuepress/dist",

        // Serverless directories
        ".serverless",

        // FuseBox cache
        ".fusebox/",

        // DynamoDB Local files
        ".dynamodb/",

        // VS Code extension files
        "*.vsix",

        // Compiled files
        "*.com",
        "*.class",
        "*.dll",
        "*.exe",
        "*.o",
        "*.so",

        // Compressed files
        "*.7z",
        "*.dmg",
        "*.gz",
        "*.iso",
        "*.jar",
        "*.rar",
        "*.tar",
        "*.zip",

        // Source maps
        "*.map",

        // Lock files (usually not needed for context)
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",

        // Minified files
        "*.min.js",
        "*.min.css",
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
