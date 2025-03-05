import * as monaco from 'monaco-editor';
import { CommandFunction } from '../types.js';
import { commandDocs } from './commandDocs.js';

/**
 * Extracts parameter information from a function
 */
function extractFunctionParams(
  func: Function,
  name: string,
): {
  params: string[];
  paramDocs: string;
  signatureHelp: monaco.languages.SignatureHelp;
} {
  const funcStr = func.toString();
  const paramMatch = funcStr.match(/\(([^)]*)\)/);
  const params = paramMatch
    ? paramMatch[1]
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p)
    : [];

  // Get documentation if available
  const doc = commandDocs[name];

  // Create documentation with parameter info
  let paramDocs = '';

  // Create signature help object
  const signatureHelp: monaco.languages.SignatureHelp = {
    signatures: [
      {
        label: `(${params.join(', ')})`,
        documentation: doc?.description || '',
        parameters: params.map((p, index) => {
          const [paramName, defaultValue] = p.split('=').map((s) => s.trim());
          const paramDoc = doc?.parameters?.[index];

          return {
            label: defaultValue ? `${paramName} = ${defaultValue}` : paramName,
            documentation: paramDoc
              ? `**${paramDoc.type}**\n\n${paramDoc.description}${paramDoc.defaultValue ? `\n\nDefault: \`${paramDoc.defaultValue}\`` : ''}`
              : `Parameter: ${paramName}${defaultValue ? ` (default: ${defaultValue})` : ''}`,
          };
        }),
      },
    ],
    activeSignature: 0,
    activeParameter: 0,
  };

  // If we have documentation, use it for the parameter docs
  if (doc) {
    paramDocs = doc.parameters
      .map(
        (p) =>
          `@param {${p.type}} ${p.name}${p.optional ? ' (optional)' : ''} - ${p.description}`,
      )
      .join('\n');

    if (doc.returns) {
      paramDocs += `\n@returns {${doc.returns.type}} ${doc.returns.description}`;
    }
  } else {
    // Fallback to extracted parameter info
    paramDocs = params
      .map((p) => {
        const [paramName, defaultValue] = p.split('=').map((s) => s.trim());
        return `@param ${paramName}${defaultValue ? ` (default: ${defaultValue})` : ''}`;
      })
      .join('\n');
  }

  return { params, paramDocs, signatureHelp };
}

/**
 * Registers command functions as completion items in Monaco editor
 * @param commands Record of command functions to register
 */
export function registerCommandCompletions(
  commands: Record<string, CommandFunction>,
): void {
  // Store command signatures for signature help provider
  const commandSignatures: Record<string, monaco.languages.SignatureHelp> = {};

  // Get all command names and their function signatures
  const commandItems = Object.entries(commands).map(([name, func]) => {
    // Extract parameter information
    const { params, paramDocs, signatureHelp } = extractFunctionParams(
      func,
      name,
    );

    // Store signature help for this command
    commandSignatures[name] = signatureHelp;

    // Get documentation if available
    const doc = commandDocs[name];

    // Create documentation markdown
    let docMarkdown = [`**${name}**`];

    if (doc?.description) {
      docMarkdown.push('', doc.description);
    }

    if (doc?.documentationUrl) {
      docMarkdown.push(
        '',
        `[📖 View Documentation](https://${doc.documentationUrl})`,
      );
    }

    if (paramDocs) {
      docMarkdown.push('', '```typescript', paramDocs, '```');
    }

    if (doc?.example) {
      docMarkdown.push('', '**Example:**', '```typescript', doc.example, '```');
    }

    return {
      label: name,
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: `${name}($0)`,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: `${name}(${params.join(', ')})`,
      documentation: {
        value: docMarkdown.join('\n'),
        isTrusted: true,
        supportThemeIcons: true,
      },
      command: {
        id: 'editor.action.triggerParameterHints',
        title: 'triggerParameterHints',
      },
    };
  });

  // Register completion provider
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: commandItems.map((item) => ({
          ...item,
          range,
        })),
      };
    },
  });

  // Register signature help provider (parameter hints)
  monaco.languages.registerSignatureHelpProvider('javascript', {
    signatureHelpTriggerCharacters: ['(', ','],
    signatureHelpRetriggerCharacters: [','],
    provideSignatureHelp: (model, position) => {
      // Get the current line up to the cursor position
      const lineContent = model.getLineContent(position.lineNumber);
      const textBeforeCursor = lineContent.substring(0, position.column - 1);

      // Find the function name before the opening parenthesis
      const functionCallMatch = textBeforeCursor.match(
        /([a-zA-Z0-9_]+)\s*\(([^)]*)?$/,
      );
      if (!functionCallMatch) {
        return null;
      }

      const functionName = functionCallMatch[1];
      const signatureHelp = commandSignatures[functionName];

      if (!signatureHelp) {
        return null;
      }

      // Count commas to determine active parameter
      const params = functionCallMatch[2] || '';
      const activeParameter = params.split(',').length - 1;

      // Get documentation if available
      const doc = commandDocs[functionName];

      // Create a rich signature help object with enhanced documentation
      const result: monaco.languages.SignatureHelp = {
        signatures: [
          {
            label: `${functionName}(${signatureHelp.signatures[0].parameters.map((p) => p.label).join(', ')})`,
            documentation: {
              value: doc?.description || `Function: ${functionName}`,
              isTrusted: true,
              supportThemeIcons: true,
            },
            parameters: signatureHelp.signatures[0].parameters.map(
              (param, index) => {
                const paramDoc = doc?.parameters[index];
                return {
                  label: param.label,
                  documentation: {
                    value: paramDoc
                      ? `**${paramDoc.type}**\n\n${paramDoc.description}${paramDoc.defaultValue ? `\n\nDefault: \`${paramDoc.defaultValue}\`` : ''}${doc?.documentationUrl ? `\n\n[📖 Documentation](https://${doc.documentationUrl})` : ''}`
                      : `Parameter: ${param.label}`,
                    isTrusted: true,
                    supportThemeIcons: true,
                  },
                };
              },
            ),
          },
        ],
        activeSignature: 0,
        activeParameter: Math.min(
          activeParameter,
          signatureHelp.signatures[0].parameters.length - 1,
        ),
      };

      return {
        value: result,
        dispose: () => {},
      };
    },
  });
}
