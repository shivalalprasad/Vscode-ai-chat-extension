import * as vscode from "vscode"

export class FileService {
  async getFileContent(filename: string): Promise<string | null> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders) {
        return null
      }

      // Search for the file in all workspace folders
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

  async writeFileContent(filename: string, content: string): Promise<void> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders) {
        throw new Error("No workspace folder found")
      }

      // Search for existing file first
      for (const folder of workspaceFolders) {
        const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, `**/${filename}`), null, 1)

        if (files.length > 0) {
          const edit = new vscode.WorkspaceEdit()
          const document = await vscode.workspace.openTextDocument(files[0])
          const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length))
          edit.replace(files[0], fullRange, content)
          await vscode.workspace.applyEdit(edit)
          return
        }
      }

      // If file doesn't exist, create it in the first workspace folder
      const newFileUri = vscode.Uri.joinPath(workspaceFolders[0].uri, filename)
      const edit = new vscode.WorkspaceEdit()
      edit.createFile(newFileUri)
      edit.insert(newFileUri, new vscode.Position(0, 0), content)
      await vscode.workspace.applyEdit(edit)
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`)
    }
  }

  async getWorkspaceFiles(): Promise<string[]> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders) {
        return []
      }

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
