import axios from "axios"

export class OpenAIService {
  private apiKey: string
  private model: string

  constructor() {
    // Use environment variable instead of VS Code settings
    this.apiKey = process.env.OPENAI_API_KEY || ""
    this.model = process.env.OPENAI_MODEL || "gpt-4"

    if (!this.apiKey) {
      console.warn("OPENAI_API_KEY environment variable not set")
    }
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.")
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
