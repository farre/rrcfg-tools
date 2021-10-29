"use strict";

const vscode = require("vscode");
const subprocess = require("child_process");

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

function stop() {
  const pty = {
    writeEmitter: new vscode.EventEmitter(),
    closeEmitter: new vscode.EventEmitter(),
    onDidWrite: this.writeEmitter.event,
    onDidClose: this.closeEmitter.event,
    constructor() {},
    open() {
      for (let task of vscode.tasks.taskExecutions) {
        task.terminate();
      }
    },
    handleInput() {},
    close() {},
  };

  return Promise.resolve(pty);
}

const tasks = [
  { name: "start", handler: start },
  { name: "stop", handler: stop },
];

let providedTasks = [];

function getTasks(type) {
  const scope = vscode.TaskScope.Workspace;
  if (providedTasks.length) {
    return providedTasks;
  }

  for (let { name, handler } of tasks) {
    let definition = { type: name };
    providedTasks.push(
      new vscode.Task(
        definition,
        scope,
        definition.type,
        type,
        new vscode.CustomExecution(handler)
      )
    );
  }

  return providedTasks;
}

module.exports = {
  getTasks,
};
