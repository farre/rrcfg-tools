"use strict";
const vscode = require("vscode");
const subprocess = require("child_process");
const tasks = require("./src/tasks");
const rrcmd = require("./src/rrcommands");

function activate() {
  let type = "rrcfg-tools";
  vscode.tasks.registerTaskProvider(type, {
    provideTasks() {
      return tasks.getTasks(type);
    },
    async resolveTask(task) {
      return task;
    },
  });
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
