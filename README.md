# Disclaimer

This project has been abandoned in favor of [midas](https://github.com/farre/midas/), the Visual Studio Code Debug Adapter.

# rrcfg-tools README

This extension adds functionality for configuring, starting, and interacting with the [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) while running [rr](https://rr-project.org/).

## News

We are currently working on another extension that in the end will replace this extension. The development of that extension can be followed at [midas on GitHub](https://github.com/farre/midas/)

## Features

- Configuring basic [rr](https://rr-project.org/) settings.
- Snippets for creating a [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) launch configuration
- Tasks for starting and stopping [rr](https://rr-project.org/) debugging.
- Short-cuts for [rr](https://rr-project.org/) commands.
- Extended UI for [rr](https://rr-project.org/) commands.

## Requirements

To use this extension [rr](https://rr-project.org/) needs to be installed.

## Extension Settings

This extension provides the following VS Code settings:

- `rrcfg-tools.hostname`: the hostname where [rr](https://rr-project.org/) is running
- `rrcfg-tools.port`: the port where [rr](https://rr-project.org/) listens
- `rrcfg-tools.bin`: the full path to the directory of the binary to be debugged
- `rrcfg-tools.cwd`: the full path to the binary to be debugged
- `rrcfg-tools.path`: the full path to [rr](https://rr-project.org/)
- `rrcfg-tools.trace-path-pick`: how to select traces

## Extension Commands

This extension provides the following VS Code commands for rr:

- `rrcfg-tools.reverse-continue`
- `rrcfg-tools.reverse-step`
- `rrcfg-tools.reverse-next`
- `rrcfg-tools.reverse-finish`

all of which map to the corresponding [rr](https://rr-project.org/).

The extension also provides the following VS Code Commands:

- `rrcfg-tools.watch`: sets a watchpoint. Whether or not this is a hardware watchpoint or software, depends on your system

## Extension Tasks

This extension provides the following VS Code tasks:

- `rrcfg-tools: start`: starts [rr](https://rr-project.org/) and begins debugging. Intended to be used as a `preLaunchTask` for [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools).
- `rrcfg-tools: stop`: stops [rr](https://rr-project.org/) and ends debugging. Intended to be used as a `postDebugTask` for [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools).

## Extension Snippets

This extension provides the following VS Code configuratoinSnippet:

- `rrcfg configuration for cppdbg`: Template for generate a [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) `launch.json` configuration compatible with running [rr](https://rr-project.org/) from this extension.

## Extension Short-Cuts

This extension provides the following default VS Code short-cuts:

- `Ctrl-F1`: set watchpoint
- `Ctrl-F5`: reverse-continue
- `Ctrl-F10`: reverse-next
- `Ctrl-F11`: reverse-step
- `Ctrl-Shift-F11`: reverse-finish

Like any VS Code command, these can be set to arbitrary keyboard inputs.

## Installation

Download the latest `rrcfg-tools-x.y.z.vsix` from [release](https://github.com/farre/rrcfg-tools/releases/latest) and install extension from file or install it directly from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=farrese.rrcfg-tools).

## Configuring a project using the extension and start a debug session

The process of adding [rr](https://rr-project.org/) debugging is streamlined using this extension. The steps are as following:

1. Go to the `Run and Debug` view and create a `launch.json` file if there isn't any. If you already have a `launch.json` you can skip this step.
2. Go to the `launch.json` file in the `.vscode` directory and add a configuration by pressing `Add Configuration...` or by pressing `Ctrl-Space` while having the cursor in the file. Select the configuration `rrcfg configuration for cppdbg`.
3. In the settings for `rrcfg-tools` add `Workspace` settings for all extension settings. `hostname` and `port` have sane defaults, currently the only valid hostname is 'localhost'. `rrcfg-tools.bin` needs to contain the full path to the binary and `rrcfg-tools.cwd` needs to contain the full path to the directory where the binary resides.
   1. Optionally configure path to [rr](https://rr-project.org/) if it isn't in `$PATH`.
   2. Optionally configure how to select traces.
4. Record something using [rr](https://rr-project.org/)!
5. Go to the `Run and Debug` view, from the drop down choose `rr`, the press `F5` or `Start Debugging`
6. Depending on how traces are selected, you will either be prompted to write the path to a trace or select one from a list.
7. A quick pick drop down will ask for the process to debug.

This will start a debug session using [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) while running [rr](https://rr-project.org/) but with [rr](https://rr-project.org/) as debugger. The regular UI and short-cuts work as expected, and the extended UI lets you interact with [rr](https://rr-project.org/) as well as the added [short-cuts](#extension-short-cuts).

## Known Issues

Currently these limitations are known:

- `rrcfg-tools.hostname` actually doesn't do much.
- Most likely only works for Linux, but doesn't check that.
- Adding a new `launch.json` and choosing `rrcfg configuration for cppdbg` doesn't work.

## Release Notes

See the [Changelog](CHANGELOG.md).

## Contributors
[farre](https://github.com/farre),
[theIDinside](https://github.com/theIDinside),
[dmitry-j-mikhin](https://github.com/dmitry-j-mikhin)
