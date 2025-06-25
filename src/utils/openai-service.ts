import axios from "axios"
import * as vscode from "vscode"

export class OpenAIService {
  private apiKey: string
  private model: string

  constructor() {
    // Try to get from environment variables first, then from VS Code settings
    this.apiKey =
      process.env.OPENAI_API_KEY || vscode.workspace.getConfiguration("aiChatAssistant").get("openaiApiKey", "")
    this.model =
      process.env.OPENAI_MODEL || vscode.workspace.getConfiguration("aiChatAssistant").get("model", "gpt-3.5-turbo")

    if (!this.apiKey) {
      console.warn("OPENAI_API_KEY environment variable not set and no API key found in settings")
    }
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error(
        "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable or configure it in VS Code settings.",
      )
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
                "You are Glitchy 🤌, a mischievous but helpful AI assistant for developers. You're playful, clever, and always ready with creative solutions.",
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
      throw new Error(`OpenAI API Error: ${error.response?.data?.error?.message || error.message}`)
    }
  }
}
