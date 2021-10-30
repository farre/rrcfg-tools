"use strict";

const path = require("path");
const vscode = require("vscode");
const subprocess = require("child_process");

function getAlternatives() {
  const rrps = `rr ps | awk 'BEGIN { OFS = ","; printf "["; sep="" } NR!=1 { printf "%s{ \\"value\\": %d,\\"label\\": \\"%d\\",\\"description\\": \\"%s\\",\\"detail\\": \\"foo\\"}",sep,$1,$3,substr($0, index($0, $4));sep=","}END {print "]"}'`;
  /** @type Thenable<readonly (vscode.QuickPickItem & {value: string})[]> */
  let picks = new Promise((resolve, reject) => {
    subprocess.exec(rrps, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(JSON.parse(stdout));
      }
    });
  });
  return picks;
}

const Action = {
  Start: "start",
  Stop: "stop",
};

class TaskProvider {
  #type = "rrcfg-tools";
  #tasks = [];
  #terminal = null;

  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
  }

  async provideTasks() {
    return this.getTasks();
  }

  resolveTask(task) {
    return this.getTask(task.definition.name);
  }

  getTasks() {
    if (this.#tasks.length) {
      return this.#tasks;
    }

    for (let action of [Action.Start, Action.Stop]) {
      this.#tasks.push(this.getTask(action));
    }

    return this.#tasks;
  }

  getTask(action) {
    const definition = { type: this.#type, task: action };
    return new vscode.Task(
      definition,
      vscode.TaskScope.Workspace,
      definition.task,
      this.#type,
      new vscode.CustomExecution(async () => {
        return this.getTerminal(action);
      })
    );
  }

  getTerminal(action) {
    if (!this.#terminal) {
      this.#terminal = new TaskTerminal();
    }

    this.#terminal.setAction(action);

    return this.#terminal;
  }
}

class TaskTerminal {
  #process = null;
  #action = Action.Start;

  constructor() {
    this.writeEmitter = new vscode.EventEmitter();
    this.onDidWrite = this.writeEmitter.event;
    this.closeEmitter = new vscode.EventEmitter();
    this.onDidClose = this.closeEmitter.event;
  }

  setAction(action) {
    this.#action = action;
  }

  open(initialDimensions) {
    switch (this.#action) {
      case Action.Start:
        this.start();
        break;
      case Action.Stop:
        this.stop();
        break;
    }
  }

  close() {}

  async start() {
    return new Promise((resolve, reject) => {
      if (this.#process) {
        reject("rr is already running");
        return;
      }
      let configuration = vscode.workspace.getConfiguration("rrcfg-tools");
      let port = configuration.get("port");
      const options = {
        canPickMany: false,
        ignoreFocusOut: true,
      };
      vscode.window
        .showQuickPick(getAlternatives(), options)
        .then((selection) => {
          let process = subprocess.spawn("rr", [
            "replay",
            "-s",
            `${port}`,
            "-p",
            `${selection.value}`,
            "-k",
          ]);
          process.stdout.on("data", (data) =>
            this.writeEmitter.fire(`${data}`)
          );
          process.stderr.on("data", (data) =>
            this.writeEmitter.fire(`err: ${data}`)
          );
          process.on("close", (code) => {
            // When process dies (i.e. when we tell rr to stop
            // replaying, this is event handler for that. We say
            // closeEmitter.fire(0) to tell vscode we can shut
            //  this pty down)
            this.closeEmitter.fire(0);
          });
          process.on("error", (err) => {
            this.writeEmitter.fire(`${err}`);
            console.log(err);
          });

          this.#process = process;
        });
    });
  }

  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.#process) {
        return;
      }

      let process = this.#process;
      this.#process = null;

      process.kill();
    });
  }
}

module.exports = {
  TaskProvider,
};
