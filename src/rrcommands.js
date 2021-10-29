const vscode = require("vscode");

/** Creates Disposable for subscribing to extension context, for rr commands
 *  - reverse step
 *  - reverse continue
 * @param {string} type
 */
function getCommands(type) {
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
  return [rev_continue, rev_step];
}

module.exports = {
  getCommands
};