"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const subprocess = require("child_process");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

// the name of the extension
const type = "rrcfg-tools";

function start() {
  const pty = {
    writeEmitter: new vscode.EventEmitter(),
    closeEmitter: new vscode.EventEmitter(),
    onDidWrite: this.writeEmitter.event,
    onDidClose: this.closeEmitter.event,
    constructor() {},
    open() {
      let configuration = vscode.workspace.getConfiguration("rrcfg-tools");
      let port = configuration.get("port");

      const rrps = `rr ps | awk 'BEGIN { OFS = ","; printf "["; sep="" } NR!=1 { printf "%s{ \\"value\\": %d,\\"label\\": \\"%d\\",\\"description\\": \\"%s\\",\\"detail\\": \\"foo\\"}",sep,$1,$3,substr($0, index($0, $4));sep=","}END {print "]"}'`;

      const options = {
        canPickMany: false,
        ignoreFocusOut: true,
      };

      /** @type Thenable<readonly (vscode.QuickPickItem & {value: string})[]> */
      let processes = new Promise((resolve, reject) => {
        subprocess.exec(rrps, (error, stdout, stderr) => {
          if (error) {
            reject(stderr);
          } else {
            resolve(JSON.parse(stdout));
          }
        });
      });

      vscode.window.showQuickPick(processes, options).then((selection) => {
        subprocess.execSync(`rr replay -s ${port} -p ${selection.value} -k`, {
          encoding: "utf8",
        });
        this.closeEmitter.fire(0);
      });
    },
    handleInput(key) {
      this.writeEmitter.fire(key);
    },
    close() {},
  };

  return Promise.resolve(pty);
}

/** @param context vscode.ExtensionContext*/
function register_rrCommands(context) {
	let rev_continue = vscode.commands.registerCommand(`${type}.reverseContinue`, () => {
		let expr = { expression: '-exec reverse-continue', context: 'repl' };
		if(vscode.debug.activeDebugSession) {
			vscode.debug.activeDebugSession.customRequest("evaluate", expr);
		} else {
			// TODO(simon): change so that this command is disabled, when no active debug session exists
			vscode.window.showErrorMessage(`${type} command 'reverse continue' failed: No active debug session.`);
		}
	});
	let rev_step = vscode.commands.registerCommand(`${type}.reverseStep`, () => {
		let expr = { expression: '-exec reverse-step', context: 'repl' };
		if(vscode.debug.activeDebugSession) {
			vscode.debug.activeDebugSession.customRequest("evaluate", expr);
		} else {
			// TODO(simon): change so that this command is disabled, when no active debug session exists
			vscode.window.showErrorMessage(`${type} command 'reverse step' failed: No active debug session.`);
		}
	});
	context.subscriptions.push([rev_continue, rev_step]);
}

let tasks = [];
/** @param context vscode.ExtensionContext*/
function activate(context) {

  vscode.tasks.registerTaskProvider(type, {
    provideTasks() {
      const scope = vscode.TaskScope.Workspace;
      if (tasks.length) {
        return tasks;
      }

      let definition = { type: type };
      tasks.push(
        new vscode.Task(
          definition,
          scope,
          "start",
          "rrcfg-tools",
          new vscode.CustomExecution(start)
        )
      );

      return tasks;
    },
    async resolveTask(task) {
      return task;
    },
  });

  register_rrCommands(context);
}

// this method is called when your extension is deactivated
function deactivate() {
  for (let task of tasks) {
    task.dispose();
  }
}

module.exports = {
  activate,
  deactivate,
};
