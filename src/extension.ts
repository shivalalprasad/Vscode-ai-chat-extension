import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs"
import { GeminiService } from "./utils/gemini-service"
import { FileService } from "./utils/file-service"

// Function to load .env file manually
function loadEnvFile() {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  if (workspaceRoot) {
    const envPath = path.join(workspaceRoot, ".env")
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8")
      const envLines = envContent.split("\n")

      for (const line of envLines) {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith("#")) {
          const [key, ...valueParts] = trimmedLine.split("=")
          if (key && valueParts.length > 0) {
            const value = valueParts.join("=").replace(/^["']|["']$/g, "")
            process.env[key.trim()] = value.trim()
          }
        }
      }
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Glitchy 🤌 extension is now active!")

  // Load environment variables
  loadEnvFile()

  const disposable = vscode.commands.registerCommand("aiChatAssistant.start", () => {
    AIChatPanel.createOrShow(context.extensionUri)
  })

  context.subscriptions.push(disposable)
}

class AIChatPanel {
  public static currentPanel: AIChatPanel | undefined
  public static readonly viewType = "aiChatAssistant"

  private readonly _panel: vscode.WebviewPanel
  private readonly _extensionUri: vscode.Uri
  private _disposables: vscode.Disposable[] = []
  private _geminiService: GeminiService
  private _fileService: FileService

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor ? vscode.ViewColumn.Beside : undefined

    if (AIChatPanel.currentPanel) {
      AIChatPanel.currentPanel._panel.reveal(column)
      return
    }

    const panel = vscode.window.createWebviewPanel(
      AIChatPanel.viewType,
      "Glitchy 🤌",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(extensionUri.fsPath, "out", "webview"))],
        retainContextWhenHidden: true,
      },
    )

    AIChatPanel.currentPanel = new AIChatPanel(panel, extensionUri)
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel
    this._extensionUri = extensionUri
    this._geminiService = new GeminiService()
    this._fileService = new FileService()

    this._update()
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

    // Listen for active editor changes
    vscode.window.onDidChangeActiveTextEditor(
      () => {
        this._sendCurrentFileInfo()
      },
      null,
      this._disposables,
    )

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        try {
          switch (message.type) {
            case "sendMessage":
              await this._handleSendMessage(message.data)
              break
            case "getCurrentFile":
              await this._handleGetCurrentFile()
              break
            case "getCurrentFileInfo":
              await this._sendCurrentFileInfo()
              break
            case "getFileContent":
              await this._handleGetFileContent(message.data.filename)
              break
            case "getWorkspaceFiles":
              await this._handleGetWorkspaceFiles()
              break
            case "getFilteredFiles":
              await this._handleGetFilteredFiles()
              break
            case "selectFile":
              await this._handleFileAttachment(message.data.filePath)
              break
          }
        } catch (error) {
          console.error("Error handling message:", error)
          this._panel.webview.postMessage({
            type: "error",
            data: { message: `Extension error: ${error}` },
          })
        }
      },
      null,
      this._disposables,
    )
  }

  private async _handleSendMessage(data: { message: string; attachedFiles: string[] }) {
    try {
      let fullMessage = ""

      // Add system context if files are attached
      if (data.attachedFiles.length > 0) {
        fullMessage += `**CONTEXT: Code Analysis Request**

The user has attached the following code files for analysis. Please review the code and then respond to their question/request.

**ATTACHED CODE FILES:**

`

        // Process attached files with proper formatting
        for (const filename of data.attachedFiles) {
          const content = await this._fileService.getFileContent(filename)
          if (content) {
            const extension = filename.split(".").pop()?.toLowerCase() || ""
            fullMessage += `### File: \`${filename}\`
\`\`\`${extension}
${content}
\`\`\`

`
          }
        }

        fullMessage += `---

**USER REQUEST:**
${data.message}

Please analyze the attached code and respond to the user's request above.`
      } else {
        // No files attached, just send the user message
        fullMessage = data.message
      }

      const response = await this._geminiService.sendMessage(fullMessage)

      this._panel.webview.postMessage({
        type: "aiResponse",
        data: { message: response },
      })
    } catch (error) {
      console.error("Error sending message:", error)
      this._panel.webview.postMessage({
        type: "error",
        data: { message: `Failed to get AI response: ${error}` },
      })
    }
  }

  private async _handleGetCurrentFile() {
    try {
      const activeEditor = vscode.window.activeTextEditor
      if (activeEditor) {
        const document = activeEditor.document
        const selection = activeEditor.selection
        const filename = path.basename(document.fileName)
        const content = !selection.isEmpty ? document.getText(selection) : document.getText()
        const language = document.languageId

        this._panel.webview.postMessage({
          type: "currentFileContent",
          data: { filename, content, language, isSelection: !selection.isEmpty },
        })
      } else {
        this._panel.webview.postMessage({
          type: "error",
          data: { message: "No active file found. Please open a file in the editor." },
        })
      }
    } catch (error) {
      console.error("Error getting current file:", error)
      this._panel.webview.postMessage({
        type: "error",
        data: { message: `Failed to get current file: ${error}` },
      })
    }
  }

  private async _sendCurrentFileInfo() {
    try {
      const fileInfo = await this._fileService.getCurrentFileInfo()
      this._panel.webview.postMessage({
        type: "currentFileInfo",
        data: { fileInfo },
      })
    } catch (error) {
      console.error("Error getting current file info:", error)
    }
  }

  private async _handleGetFileContent(filename: string) {
    try {
      const content = await this._fileService.getFileContent(filename)
      this._panel.webview.postMessage({
        type: "fileContent",
        data: { filename, content },
      })
    } catch (error) {
      console.error("Error getting file content:", error)
      this._panel.webview.postMessage({
        type: "error",
        data: { message: `Failed to read file ${filename}: ${error}` },
      })
    }
  }

  private async _handleGetWorkspaceFiles() {
    try {
      const files = await this._fileService.getWorkspaceFiles()
      this._panel.webview.postMessage({
        type: "workspaceFiles",
        data: { files },
      })
    } catch (error) {
      console.error("Error getting workspace files:", error)
      this._panel.webview.postMessage({
        type: "error",
        data: { message: `Failed to get workspace files: ${error}` },
      })
    }
  }

  private async _handleGetFilteredFiles() {
    try {
      const codeExtensions = this._fileService.getCodeFileExtensions()
      const files = await this._fileService.getFilteredWorkspaceFiles(codeExtensions)
      this._panel.webview.postMessage({
        type: "filteredFiles",
        data: { files },
      })
    } catch (error) {
      console.error("Error getting filtered files:", error)
      this._panel.webview.postMessage({
        type: "error",
        data: { message: `Failed to get filtered files: ${error}` },
      })
    }
  }

  private async _handleFileAttachment(filePath: string) {
    try {
      const content = await this._fileService.getFileContent(filePath)
      if (content) {
        const filename = path.basename(filePath)

        this._panel.webview.postMessage({
          type: "fileContent",
          data: { filename, content },
        })
      } else {
        this._panel.webview.postMessage({
          type: "error",
          data: { message: `Failed to read file: ${filePath}` },
        })
      }
    } catch (error) {
      console.error("Error attaching file:", error)
      this._panel.webview.postMessage({
        type: "error",
        data: { message: `Failed to attach file: ${error}` },
      })
    }
  }

  public dispose() {
    AIChatPanel.currentPanel = undefined
    this._panel.dispose()
    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  private _update() {
    this._panel.webview.html = this._getHtmlForWebview()
  }

  private _getHtmlForWebview() {
    const scriptUri = this._panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(this._extensionUri.fsPath, "out", "webview", "webview.js")),
    )

    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Glitchy 🤌</title>
                <style>
                  body { margin: 0; padding: 0; overflow: hidden; }
                </style>
            </head>
            <body>
                <div id="root"></div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`
  }
}

export function deactivate() {}
