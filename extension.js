"use strict";
const vscode = require("vscode");
const tasks = require("./src/tasks");
const rrcmd = require("./src/rrcommands");

/**
 * @param { vscode.ExtensionContext } context
 */
function activate(context) {
  const type = "rrcfg-tools";
  vscode.tasks.registerTaskProvider(type, {
    provideTasks() {
      return tasks.getTasks(type);
    },
    async resolveTask(task) {
      return task;
    },
  });
  context.subscriptions.push(...rrcmd.getCommands(type));
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
