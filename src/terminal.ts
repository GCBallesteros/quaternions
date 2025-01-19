import { log } from './logger.js';

import { CommandFunction, State } from './types.js';

import {
  geo2xyz,
  getPositionOfPoint,
  sph2xyz,
  validateName,
  xyz2geo,
  xyz2sph,
} from './utils.js';

function _avoidTreeShaking() {
  console.log({
    getPositionOfPoint,
    validateName,
    xyz2geo,
    xyz2sph,
    geo2xyz,
    sph2xyz,
  });
}
_avoidTreeShaking();

export function buildExecuteCommand(
  commands: Record<string, CommandFunction>,
  state: State,
  switchCamera: any,
): (command: string) => void {
  // NOTE: state or switchCamera are not used but are required there so that
  // they are available in the eval context

  // Context object for additional state
  const ctx = {};

  // Dynamically build the available commands as variables
  const commandDeclarations = Object.entries(commands)
    .map(([key, _]) => `const ${key} = commands["${key}"];`)
    .join('\n');

  function executeCommand(command: string): void {
    if (command) {
      try {
        const codeToExecute = `${commandDeclarations}\n${command}`;
        const result = eval(codeToExecute);
        Promise.resolve(result)
          .then((resolvedValue) => {
            if (resolvedValue !== undefined) {
              log(`  ${resolvedValue}`);
            }
          })
          .catch((error: unknown) => {
            if (error instanceof Error) {
              log(`Error: ${error.message}`);
            } else {
              log(`Error: ${String(error)}`);
            }
          });
      } catch (error: unknown) {
        if (error instanceof Error) {
          log(`Error: ${error.message}`);
        } else {
          log(`Error: ${String(error)}`);
        }
      }
    }
  }
  return executeCommand;
}
