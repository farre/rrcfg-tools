const vscode = require("vscode");

/// rr commands registered with the extension
const rrCommandNames = ["reverse-continue", "reverse-step", "reverse-next", "reverse-finish"];

/** Creates Disposable for subscribing to extension context, for rr commands
 * @param {string} extension_name - the name of this extension.
 */
function getCommands(extension_name) {
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

module.exports = {
  getCommands
};
