import * as THREE from 'three';

import { log } from './logger.js';
import { NamedTargets } from './types/orientation.js';
import { CommandFunction, State } from './types.js';
import { Vector3 } from './vectors.js';

export function buildExecuteCommand(
  commands: Record<string, CommandFunction>,
  state: State,
  switchCamera: (newCamera: THREE.PerspectiveCamera) => void,
): (command: string) => Promise<void> {
  // Context object to maintain state between executions
  const context = {
    console,
    Math,
    Date,
    commands,
    state,
    switchCamera,
    log,
    NamedTargets,
    Vector3,
  };

  // Pre-declare command variables
  const commandDeclarations = Object.entries(commands)
    .map(([key, _]) => `const ${key} = commands["${key}"];`)
    .join('\n');

  return async (command: string): Promise<void> => {
    if (!command) {
      return;
    }

    try {
      const wrappedCode = `
        ${commandDeclarations}
        return (async () => { 
            return await (async () => { 
              ${command}
            })();
        })();
        //# sourceURL=evalCode.js
      `;

      // Create function with context parameters
      const contextKeys = Object.keys(context);
      const contextValues = Object.values(context);
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const executeFunction = new Function(...contextKeys, wrappedCode);

      // Execute with context
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await executeFunction(...contextValues);

      if (result !== undefined) {
        log(`  ${result}`);
      }
    } catch (error) {
      // We need to correct for:
      // - all the commands implicitly at the top
      // - the extra line for the prety code
      // - 2 lines with the returns
      // - 2 mistery lines
      const errorOffset = Object.keys(commands).length + 1 + 2 + 2;
      if (error instanceof Error) {
        const firstErrorLine = error.stack?.split('\n')[0];
        let lineNumber: number | null = null;

        if (firstErrorLine !== undefined) {
          const match = firstErrorLine.match(/evalCode\.js:(\d+):(\d+)/);

          if (match) {
            lineNumber = parseInt(match[1], 10) - errorOffset;
            log(`Error : ${error.message} (line ${lineNumber})`);
          } else {
            log(`Error : ${error.message}`);
          }
        } else {
          log(`Error : ${error.message}`);
        }
      } else {
        log(`Error: ${String(error)}`);
      }
    }
  };
}
