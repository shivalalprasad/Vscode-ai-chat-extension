import * as vscode from "vscode"

export class FileService {
  async getFileContent(filename: string): Promise<string | null> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders) return null

      for (const folder of workspaceFolders) {
        const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, `**/${filename}`), null, 1)

        if (files.length > 0) {
          const document = await vscode.workspace.openTextDocument(files[0])
          return document.getText()
        }
      }
      return null
    } catch (error) {
      console.error("Error reading file:", error)
      return null
    }
  }

  async getWorkspaceFiles(): Promise<string[]> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders) return []

      const files: string[] = []
      for (const folder of workspaceFolders) {
        const foundFiles = await vscode.workspace.findFiles(
          new vscode.RelativePattern(folder, "**/*"),
          "**/node_modules/**",
          100,
        )

        foundFiles.forEach((file) => {
          const relativePath = vscode.workspace.asRelativePath(file)
          files.push(relativePath)
        })
      }

      return files.sort()
    } catch (error) {
      console.error("Error getting workspace files:", error)
      return []
    }
  }
}
