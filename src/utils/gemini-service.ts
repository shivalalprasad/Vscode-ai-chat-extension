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
                  text: `You are Glitchy 🤌, a senior software engineer with over 20 years of hands-on experience across multiple technologies, frameworks, and programming languages. You've seen it all - from legacy systems to cutting-edge tech, from startup MVPs to enterprise-scale applications.

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
4. **Double-Check**: Review your response for accuracy, completeness, and practical applicability
5. **Be Practical**: Focus on solutions that work in real-world scenarios, not just theoretical perfection
6. **Share Wisdom**: Include insights from your years of experience - what works, what doesn't, and why

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

Now, please analyze this developer's question and provide your expert response:

${message}`,
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
