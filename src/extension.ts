import * as vscode from "vscode"
import * as path from "path"
import { config } from "dotenv"
import { OpenAIService } from "./utils/openai-service"
import { FileService } from "./utils/file-service"

// Load environment variables from the workspace root
const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
if (workspaceRoot) {
  config({ path: path.join(workspaceRoot, ".env") })
}

export function activate(context: vscode.ExtensionContext) {
  console.log("AI Chat Assistant extension is now active!")

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
  private _openaiService: OpenAIService
  private _fileService: FileService

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor ? vscode.ViewColumn.Beside : undefined

    if (AIChatPanel.currentPanel) {
      AIChatPanel.currentPanel._panel.reveal(column)
      return
    }

    const panel = vscode.window.createWebviewPanel(
      AIChatPanel.viewType,
      "AI Chat Assistant",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(extensionUri.fsPath, "out", "webview"))],
      },
    )

    AIChatPanel.currentPanel = new AIChatPanel(panel, extensionUri)
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel
    this._extensionUri = extensionUri
    this._openaiService = new OpenAIService()
    this._fileService = new FileService()

    this._update()
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.type) {
          case "sendMessage":
            await this._handleSendMessage(message.data)
            break
          case "getCurrentFile":
            await this._handleGetCurrentFile()
            break
          case "getFileContent":
            await this._handleGetFileContent(message.data.filename)
            break
          case "getWorkspaceFiles":
            await this._handleGetWorkspaceFiles()
            break
        }
      },
      null,
      this._disposables,
    )
  }

  private async _handleSendMessage(data: { message: string; attachedFiles: string[] }) {
    try {
      let fullMessage = data.message
      const fileContents: string[] = []

      for (const filename of data.attachedFiles) {
        const content = await this._fileService.getFileContent(filename)
        if (content) {
          fileContents.push(`File: ${filename}\n\`\`\`\n${content}\n\`\`\``)
        }
      }

      if (fileContents.length > 0) {
        fullMessage += "\n\nAttached files:\n" + fileContents.join("\n\n")
      }

      const response = await this._openaiService.sendMessage(fullMessage)

      this._panel.webview.postMessage({
        type: "aiResponse",
        data: { message: response },
      })
    } catch (error) {
      this._panel.webview.postMessage({
        type: "error",
        data: { message: `Error: ${error}` },
      })
    }
  }

  private async _handleGetCurrentFile() {
    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      const document = activeEditor.document
      const selection = activeEditor.selection
      const filename = path.basename(document.fileName)
      const content = !selection.isEmpty ? document.getText(selection) : document.getText()

      this._panel.webview.postMessage({
        type: "currentFileContent",
        data: { filename, content, isSelection: !selection.isEmpty },
      })
    }
  }

  private async _handleGetFileContent(filename: string) {
    const content = await this._fileService.getFileContent(filename)
    this._panel.webview.postMessage({
      type: "fileContent",
      data: { filename, content },
    })
  }

  private async _handleGetWorkspaceFiles() {
    const files = await this._fileService.getWorkspaceFiles()
    this._panel.webview.postMessage({
      type: "workspaceFiles",
      data: { files },
    })
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
                <title>AI Chat Assistant</title>
            </head>
            <body>
                <div id="root"></div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`
  }
}

export function deactivate() {}
