# Glitchy 🤌 - AI Chat Assistant for Developers

A Visual Studio Code extension that provides Glitchy 🤌, your mischievous AI coding companion with workspace code awareness and file-attachment context.

## Features

- **React-based WebView Chat Panel**: Clean, responsive chat interface with markdown rendering and syntax highlighting
- **File Attachment Support**: Use `@filename.ext` syntax to attach files from your workspace
- **Context-Aware Communication**: "Use Current File" button to include active editor content or selection
- **Code Application**: Apply Glitchy's 🤌 generated code directly to your files with one click
- **Workspace Integration**: Full integration with VS Code's file system and editor APIs
- **Google Gemini Integration**: Powered by Google's Gemini AI models

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Visual Studio Code (v1.74.0 or higher)
- Google Gemini API key

### Development Setup

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd ai-chat-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Get your Gemini API key:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

4. Configure your Gemini API key:
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env and add your Gemini API key
   # GEMINI_API_KEY=your_actual_api_key_here
   # GEMINI_MODEL=gemini-1.5-flash
   ```

5. Build the extension:
   ```bash
   npm run compile
   ```

6. Open the project in VS Code and press `F5` to run the extension in a new Extension Development Host window.

### Configuration

The extension uses environment variables for configuration:

- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `GEMINI_MODEL`: Gemini model to use (default: "gemini-1.5-flash")

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

**Important**: Never commit your `.env` file to version control. The `.env` file is already included in `.gitignore`.

## Available Models

- ✅ `gemini-1.5-flash` (Fast and efficient, free tier available)
- ✅ `gemini-1.5-pro` (More capable, may require paid usage)
- ✅ `gemini-pro` (Legacy model)

## Usage

### Starting the Chat

1. Open the Command Palette (`Ctrl/Cmd + Shift + P`)
2. Type "Start Glitchy 🤌" and press Enter
3. The chat panel will open in a new webview with your AI companion

### Basic Chat

- Type your message in the input box at the bottom
- Press Enter or click Send to send your message
- Glitchy 🤌 will respond with helpful information, code examples, or suggestions

### File Attachments

- Use `@filename.ext` syntax in your messages to attach files
- The extension will autocomplete available files from your workspace
- Attached files are included as context for the AI

### Using Current File

- Click the "📄 Use Current File" button to include your active editor content
- If you have text selected, only the selection will be included
- Otherwise, the entire file content will be sent to Glitchy 🤌

### Applying Code Changes

- When Glitchy 🤌 provides code that references a specific file, you'll see "💾 Apply to filename" buttons
- Click these buttons to automatically apply the code changes to the referenced files
- The extension will update the files in your workspace

## Commands

- `Start Glitchy 🤌`: Opens the chat panel with your mischievous AI companion

## Settings

- `aiChatAssistant.geminiApiKey`: Your Google Gemini API key (required)
- `aiChatAssistant.model`: Gemini model to use (default: "gemini-1.5-flash")

## Development

### Building

```bash
# Compile TypeScript
npm run compile

# Build React webview
npm run webpack

# Build for production
npm run vscode:prepublish
```

### Debugging

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. In the new window, use `Ctrl/Cmd + Shift + I` to open Developer Tools for debugging the webview

### Project Structure

```
src/
├── extension.ts              # Main extension entry point
├── utils/
│   ├── gemini-service.ts    # Google Gemini API integration
│   └── file-service.ts      # File system operations
└── webview/
    ├── App.tsx              # Main React app
    ├── components/          # React components
    │   ├── ChatPanel.tsx
    │   ├── MessageBubble.tsx
    │   ├── MessageInput.tsx
    │   └── FileAttachment.tsx
    ├── types.ts             # TypeScript type definitions
    ├── index.tsx            # React entry point
    └── styles.css           # CSS styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information about the problem
3. Include your VS Code version, extension version, and any error messages

## Changelog

### 1.0.0

- Initial release
- React-based chat interface
- File attachment support with @filename syntax
- Google Gemini integration with environment variable configuration
- Code application feature
- Workspace file integration
