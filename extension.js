"use strict";
const vscode = require("vscode");
const commands = require("./src/commands");
const tasks = require("./src/tasks");

let taskProvider;
/**
 * @param { vscode.ExtensionContext } context
 */
function activate(context) {
  const type = "rrcfg-tools";
  const workspaceRoot =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;
  if (!workspaceRoot) {
    return;
  }
  context.subscriptions.push(...commands.getCommands(type));
  context.subscriptions.push(...commands.getCommandsWithParams(type));

  taskProvider = vscode.tasks.registerTaskProvider(
    "rrcfg-tools",
    new tasks.TaskProvider()
  );
}

// this method is called when your extension is deactivated
function deactivate() {
  if (taskProvider) {
    taskProvider.dispose();
  }
}

module.exports = {
  activate,
  deactivate,
};
