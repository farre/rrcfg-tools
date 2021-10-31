const vscode = require("vscode");

/// rr commands registered with the extension
const rrCommandNames = ["reverse-continue", "reverse-step", "reverse-next", "reverse-finish"];

/**
 * @typedef { {name: string, arg: string, title: string, placeHolder: string } } rrCommandRequiringInput
 * @type { rrCommandRequiringInput[] }
*/
const rrCommandWithParam = [
  {name: "watch", arg: "-l", title: "Input name of location to set (write) watchpoint for", placeHolder: "Watch variable name/location for writes" }
];

/** Creates Disposable for subscribing to extension context, for rr commands
 * @param {string} extension_name - the name of this extension.
 * @returns {vscode.Disposable[]}
 */
function getCommands(extension_name) {
    /**
   * @param { string } name
   * @returns { vscode.Disposable }
   */
  const mapNameToCommand = (name) => {
    return vscode.commands.registerCommand(`${extension_name}.${name}`, () => {
      let expr = { expression: `-exec ${name}`, context: 'repl' };
      if(vscode.debug.activeDebugSession) {
        vscode.debug.activeDebugSession.customRequest("evaluate", expr);
      } else {
        // TODO(simon): change so that this command is disabled, when no active debug session exists
        vscode.window.showErrorMessage(`${extension_name} command '${name}' failed: No active debug session.`);
      }
    })
  };
  return rrCommandNames.map(mapNameToCommand);
}

/** Creates Disposable for subscribing to extension context, for rr commands
 * @param { string } extension_name - the name of this extension.
 * @returns { vscode.Disposable[] }
 */
function getCommandsWithParams(extension_name) {
  /**
   * @param { rrCommandRequiringInput } cmd
   * @returns { vscode.Disposable }
   */
  const mapNameToCommand = ({name, arg, title, placeHolder}) => {
    return vscode.commands.registerCommand(`${extension_name}.${name}`, () => {
      if(vscode.debug.activeDebugSession) {
        vscode.window.showInputBox({title: title, placeHolder: placeHolder, ignoreFocusOut: true }).then(value => {
          if(value) {
            let expr = { expression: `-exec ${name} ${arg} ${value}`, context: 'repl' };
            vscode.debug.activeDebugSession.customRequest("evaluate", expr);
          }
        });
      } else {
        // TODO(simon): change so that this command is disabled, when no active debug session exists
        vscode.window.showErrorMessage(`${extension_name} command '${name}' failed: No active debug session.`);
      }
    });
  }
  return rrCommandWithParam.map(mapNameToCommand);
}

module.exports = {
  getCommands,
  getCommandsWithParams
};
