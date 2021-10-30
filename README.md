# rrcfg-tools README

This extension adds functionality for configuring, starting, and interacting with the [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) while running [rr](https://rr-project.org/).

## Features

- Configuring basic [rr](https://rr-project.org/) settings.
- Snippets for creating a [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) launch configuration
- Tasks for starting and stopping [rr](https://rr-project.org/) debugging.
- Short-cuts for `reverse-next` and `reverse-continue`

## Requirements

To use this extension [rr](https://rr-project.org/) needs to be installed and accessible from the `PATH`.

## Extension Settings

This extension provides the following VS Code settings:

- `rrcfg-tools.hostname`: the hostname where [rr](https://rr-project.org/) is running
- `rrcfg-tools.port`: the port where [rr](https://rr-project.org/) listens
- `rrcfg-tools.cwd`: the full path to the binary to be debugged
- `rrcfg-tools.bin`: the full path to the directory of the binary to be debugged

## Extension Commands

This extension provides the following VS Code commands:

- `rrcfg-tools.reverse-continue`
- `rrcfg-tools.reverse-step`
- `rrcfg-tools.reverse-next`
- `rrcfg-tools.reverse-finish`

all of which map to the corresponding [rr](https://rr-project.org/).

## Extension Tasks

This extension provides the following VS Code tasks:

- `rrcfg-tools: start`: starts [rr](https://rr-project.org/) and begins debugging. Intended to be used as a `preLaunchTask` for [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools).
- `rrcfg-tools: stop`: stops [rr](https://rr-project.org/) and ends debugging. Intended to be used as a `postDebugTask` for [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools).

## Extension Snippets

This extension provides the following VS Code snippet:

- `TODO(farre): what is the name of the snippet`: Template for generate a [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) `launch.json` configuration compatible with running [rr](https://rr-project.org/) from this extension.

## Extension Short-Cuts

This extension provides the following VS Code short-cuts:

- `Ctrl-F5`: reverse-next
- `Ctrl-F10`: reverse-continue

## Known Issues

Currently these limitations are known:

- `rrcfg-tools.hostname` actually doesn't do much.

## Release Notes

### 1.0.0

First release of `rrcfg-tools`!

This release introduce following changes:

- Configuring debugging for [rr](https://rr-project.org/)
- Starting and stopping using tasks usable from [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) `launch.json`
- Commands for interacting with [rr](https://rr-project.org/), with appropriate short-cuts
- Easy template insertion for creating [rr](https://rr-project.org/) configuration for [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) `launch.json`
