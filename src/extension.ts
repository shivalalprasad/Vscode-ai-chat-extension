import * as vscode from "vscode"
import * as path from "path"
import { GeminiService } from "./geminiService"

export function activate(context: vscode.ExtensionContext) {
  const provider = new CodeChatViewProvider(context.extensionUri)

  context.subscriptions.push(vscode.window.registerWebviewViewProvider(CodeChatViewProvider.viewType, provider))

  context.subscriptions.push(
    vscode.commands.registerCommand("code-chat.clearHistory", () => {
      provider.clearHistory()
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("code-chat.openSettings", () => {
      vscode.commands.executeCommand("workbench.action.openSettings", "code-chat")
    }),
  )
}

class CodeChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "code-chat.codeChatView"

  private _view?: vscode.WebviewView
  private _geminiService: GeminiService
  private _messageHistory: { role: string; content: string }[] = []
  private _workspaceRoot: string

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._geminiService = new GeminiService()
    this._workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || ""
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    }

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "sendMessage": {
          await this._handleSendMessage(data.message, data.attachedFiles)
          break
        }
        case "loadHistory": {
          this._panel?.webview.postMessage({
            type: "historyLoaded",
            data: this._messageHistory,
          })
          break
        }
        case "saveSettings": {
          this._geminiService.apiKey = data.apiKey
          break
        }
        case "getSettings": {
          this._panel?.webview.postMessage({
            type: "settingsLoaded",
            data: { apiKey: this._geminiService.apiKey },
          })
          break
        }
      }
    })
  }

  public clearHistory() {
    this._messageHistory = []
    this._view?.webview.postMessage({ type: "historyCleared" })
  }

  private async _handleSendMessage(message: string, attachedFiles: string[] = []) {
    try {
      let fullPrompt = ""

      // Add Glitchy's system prompt
      const systemPrompt = `You are Glitchy 🤌, a senior software engineer with over 20 years of hands-on experience across multiple technologies, frameworks, and programming languages. You've seen it all - from legacy systems to cutting-edge tech, from startup MVPs to enterprise-scale applications.

**Your Expertise:**
- 20+ years of software development experience
- Deep knowledge of multiple programming languages, frameworks, and architectures
- Experience with debugging complex issues, performance optimization, and code reviews
- Understanding of software engineering best practices, design patterns, and clean code principles
- Hands-on experience with DevOps, testing strategies, and production systems
- Mentored countless developers and solved thousands of real-world problems

**Your Approach:**
1. **Understand First**: Carefully analyze the user's problem, considering context and potential edge cases
2. **Think Like a Veteran**: Draw from your extensive experience to provide battle-tested solutions
3. **Be Thorough**: Provide comprehensive answers with explanations, alternatives, and potential pitfalls
4. **Be Practical**: Focus on solutions that work in real-world scenarios, not just theoretical perfection
5. **Share Wisdom**: Include insights from your years of experience - what works, what doesn't, and why

**Your Personality:**
- Mischievous but professional 🤌
- Direct and honest about trade-offs
- Enthusiastic about elegant solutions
- Patient with beginners, challenging for experts
- Always ready with a clever workaround or optimization

**Response Format:**
- Start with a clear understanding of the problem
- Provide the best solution based on your experience
- Explain the reasoning behind your recommendations
- Mention potential alternatives or considerations
- Include any relevant warnings or best practices
- End with actionable next steps

---

`

      if (attachedFiles.length > 0) {
        fullPrompt += systemPrompt + "**ATTACHED CODE FILES FOR ANALYSIS:**\n\n"

        for (const filePath of attachedFiles) {
          try {
            const fileUri = vscode.Uri.file(path.join(this._workspaceRoot, filePath))
            const fileContent = await vscode.workspace.fs.readFile(fileUri)
            const content = Buffer.from(fileContent).toString("utf8")
            const extension = path.extname(filePath).substring(1)

            fullPrompt += `**File: ${filePath}**\n\`\`\`${extension}\n${content}\n\`\`\`\n\n`
          } catch (error) {
            fullPrompt += `**File: ${filePath}** - Error reading file: ${error}\n\n`
          }
        }

        fullPrompt += `**DEVELOPER'S REQUEST:**\n${message}\n\n**Please analyze the attached code and respond to the developer's request with your expert guidance.**`
      } else {
        fullPrompt = systemPrompt + `**DEVELOPER'S QUESTION:**\n${message}\n\n**Please provide your expert response:**`
      }

      const response = await this._geminiService.generateResponse(fullPrompt)

      this._panel?.webview.postMessage({
        type: "aiResponse",
        data: { message: response },
      })
    } catch (error) {
      console.error("Error handling message:", error)
      this._panel?.webview.postMessage({
        type: "error",
        data: { message: error instanceof Error ? error.message : "Unknown error occurred" },
      })
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.js"))
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"))
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"))
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.css"))

    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css"),
    )

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link rel="stylesheet" href="${styleResetUri}">
				<link rel="stylesheet" href="${styleVSCodeUri}">
				<link rel="stylesheet" href="${styleMainUri}">
				<link rel="stylesheet" href="${codiconsUri}">

				<title>Code Chat</title>
			</head>
			<body>
				<div class="chat-container">
					<div class="messages" id="messages"></div>
					<div class="input-area">
						<div class="file-attach">
							<input type="file" multiple id="fileInput" style="display: none;" />
							<label for="fileInput" class="file-label">
								<i class="codicon codicon-attach"></i>
							</label>
							<div id="fileList"></div>
						</div>
						<textarea id="chatInput" placeholder="Ask a question..."></textarea>
						<button id="sendButton" class="send-button">Send</button>
					</div>
				</div>
				<script src="${scriptUri}"></script>
			</body>
			</html>`
  }

  public get _panel() {
    return this._view
  }
}
