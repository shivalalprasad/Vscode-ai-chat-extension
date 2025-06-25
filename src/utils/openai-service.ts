import axios from "axios"

export class OpenAIService {
  private apiKey: string
  private model: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ""
    this.model = process.env.OPENAI_MODEL || "gpt-4"

    if (!this.apiKey) {
      console.warn("OPENAI_API_KEY environment variable not set")
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
              content: "You are a helpful AI assistant for developers.",
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
