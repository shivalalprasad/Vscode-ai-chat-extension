import axios from "axios"
import * as vscode from "vscode"

export class GeminiService {
  private apiKey: string
  private model: string

  constructor() {
    // Try to get from environment variables first, then from VS Code settings
    this.apiKey =
      process.env.GEMINI_API_KEY || vscode.workspace.getConfiguration("aiChatAssistant").get("geminiApiKey", "")
    this.model =
      process.env.GEMINI_MODEL || vscode.workspace.getConfiguration("aiChatAssistant").get("model", "gemini-1.5-flash")

    if (!this.apiKey) {
      console.warn("GEMINI_API_KEY environment variable not set and no API key found in settings")
    }
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error(
        "Gemini API key not configured. Please set GEMINI_API_KEY environment variable or configure it in VS Code settings.",
      )
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful AI assistant for developers. Please respond to the following:\n\n${message}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0]
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          return candidate.content.parts[0].text
        }
      }

      throw new Error("No valid response from Gemini API")
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(`Gemini API Error: ${error.response.data.error.message}`)
      }
      throw new Error(`Gemini API Error: ${error.message}`)
    }
  }
}
