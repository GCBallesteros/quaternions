import { log } from './logger.js';
import { NamedTargets } from './points/satellite.js';
import { CommandFunction, State } from './types.js';

export function buildExecuteCommand(
  commands: Record<string, CommandFunction>,
  state: State,
  switchCamera: any,
): (command: string) => void {
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
  };

  // Pre-declare command variables
  const commandDeclarations = Object.entries(commands)
    .map(([key, _]) => `const ${key} = commands["${key}"];`)
    .join('\n');

  return async (command: string): Promise<void> => {
    if (!command) return;

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
      const executeFunction = new Function(...contextKeys, wrappedCode);

      // Execute with context
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
      const errorLineNumber =
        error.lineNumber - Object.keys(commands).length - 1 - 2 - 2;
      console.log(error);
      if (error instanceof Error) {
        log(`Error ${errorLineNumber}: ${error.message}`);
      } else {
        log(`Error ${errorLineNumber}: ${String(error)}`);
      }
    }
  };
}
