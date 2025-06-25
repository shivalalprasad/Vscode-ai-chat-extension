import * as vscode from "vscode"
import axios from "axios"

export class OpenAIService {
  private apiKey: string
  private model: string

  constructor() {
    const config = vscode.workspace.getConfiguration("aiChatAssistant")
    this.apiKey = config.get("openaiApiKey") || ""
    this.model = config.get("model") || "gpt-4"

    if (!this.apiKey) {
      vscode.window
        .showWarningMessage("OpenAI API key not configured. Please set it in VS Code settings.", "Open Settings")
        .then((selection) => {
          if (selection === "Open Settings") {
            vscode.commands.executeCommand("workbench.action.openSettings", "aiChatAssistant.openaiApiKey")
          }
        })
    }
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured")
    }

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: this.model,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant for developers. You can help with code analysis, generation, refactoring, and general programming questions. When providing code examples, use appropriate syntax highlighting.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        },
      )

      return response.data.choices[0].message.content
    } catch (error: any) {
      if (error.response) {
        throw new Error(`OpenAI API Error: ${error.response.data.error?.message || "Unknown error"}`)
      } else {
        throw new Error(`Network Error: ${error.message}`)
      }
    }
  }
}
