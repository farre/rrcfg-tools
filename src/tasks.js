"use strict";

const path = require("path");
const vscode = require("vscode");
const subprocess = require("child_process");

/**
 * @returns { Thenable<string[]> }
 */
function getTraces() {
  return new Promise((resolve, reject) => {
    subprocess.exec(`rr ls -l -t -r`, (err, stdout, stderr) => {
      if (err) {
        reject(stderr);
      } else {
        let lines = stdout.split("\n").splice(1);
        const traces = lines
          .map((line) => line.split(" ")[0].trim())
          .filter((trace) => trace.length > 0);
        resolve(traces);
      }
    });
  });
}

/** @type {(trace: string) => Thenable<readonly (vscode.QuickPickItem & {value: string})[]>} */
function getTraceInfo(trace) {
  const prefix = `'BEGIN { OFS = ","; printf "["; sep="" } NR!=1`;
  const suffix = `END { print "]" }`;

  const json = `\\"pid\\": %d,\\"ppid\\": \\"%s\\",\\"exit\\": \\"%d\\",\\"cmd\\": \\"%s\\"`;
  const rrps = `rr ps ${trace} | awk ${prefix} { printf "%s{ ${json} }",sep,$1,$2,$3,substr($0, index($0, $4));sep=","} ${suffix}'`;

  return new Promise((resolve, reject) => {
    subprocess.exec(rrps, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(JSON.parse(stdout));
      }
    });
  }).then((picks) =>
    picks.map(({ pid, ppid, exit, cmd }) => {
      return {
        value: pid,
        label: `${path.basename(cmd.split(" ")[0] ?? cmd)}`,
        description: `PID: ${pid}, PPID: ${
          ppid === "--" ? "--" : +ppid
        }, EXIT: ${exit}`,
        detail: cmd,
      };
    })
  );
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
    let t = new vscode.Task(
      definition,
      vscode.TaskScope.Workspace,
      definition.task,
      this.#type,
      new vscode.CustomExecution(async () => {
        return this.getTerminal(action);
      }),
      "rrstartMatcher"
    );
    t.isBackground = true;
    return t;
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
      const configuration = vscode.workspace.getConfiguration("rrcfg-tools");
      const port = configuration.get("port");
      const options = {
        canPickMany: false,
        ignoreFocusOut: true,
        title: "Select process to debug",
      };
      const rrPath = configuration.get("rr-path");
      const traceDir = configuration.get("trace-path-pick");

      const tracePicked = (tracePath) => {
        vscode.window
          .showQuickPick(getTraceInfo(tracePath))
          .then((selection) => {
            let process = subprocess.spawn(rrPath, [
              "replay",
              "-s",
              `${port}`,
              "-p",
              `${selection[0].value}`,
              "-k",
            ]);
            process.stdout.on("data", (data) => {
              for (const line of `${data}`.split("\n")) {
                this.writeEmitter.fire(`${line}\r\n`);
              }
            });
            process.stderr.on("data", (data) => {
              for (const line of `${data}`.split("\n")) {
                this.writeEmitter.fire(`${line}\r\n`);
              }
            });
            process.on("exit", (exit_code) => {
              this.closeEmitter.fire();
            });
            process.on("error", (err) => {
              for (const line of `${err}`.split("\n")) {
                this.writeEmitter.fire(`${line}\r\n`);
                console.log(`${line}`);
              }
            });

            this.#process = process;
          });
      };

      switch (traceDir) {
        case "RR_TRACE_DIR":
          vscode.window.showQuickPick(getTraces(), options).then(tracePicked);
          break;
        case "User provided":
          const opts = {
            ignoreFocusOut: true,
            prompt: "Full path to rr trace dir",
            placeHolder: "/path/to/tracedir",
          };
          vscode.window.showInputBox(opts).then(tracePicked);
          break;
      }
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
