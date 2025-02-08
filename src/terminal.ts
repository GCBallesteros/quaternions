import { log } from './logger.js';
import { NamedTargets } from './point.js';
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
      // Create function with command declarations in its scope
      const wrappedCode = `
        ${commandDeclarations}
        return (async () => { 
          try {
            return await (async () => { 
              ${command}
            })();
          } catch (error) {
            if (error instanceof Error) {
              log(\`Error: \${error.message}\`);
            } else {
              log(\`Error: \${String(error)}\`);
            }
          }
        })();
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        log(`Error: ${error.message}`);
      } else {
        log(`Error: ${String(error)}`);
      }
    }
  };
}
