import { render } from 'lit-html';
import * as monaco from 'monaco-editor';
import { None, Option, Some } from 'ts-results';

import { initLogger } from '../logger.js';
import { CommandFunction } from '../types.js';

import { editorTemplate } from './editorTemplates.js';
import { registerCommandCompletions } from './monacoConfig.js';

export const satelliteScript = `// %% Reset
// Reset scene so that we can hit execute repeatedly
// on this sample script without errors
reset();

// %% Setup simulation parameters
const target_coords_ecef = geo2xyz([60.186, 24.828, 0]);
const satellite_location_geo = [62.0, 34.0, 500.0];
// quaternions are in xyzw order
const satellite_bad_quat = [
    -0.6313439,
    -0.1346824,
    -0.6313439,
    -0.4297329
];

// Move the default point, 'sat', to somewhere somewhat near Helsinki
mov("sat", satellite_location_geo, true);
// Add a point over the previously calculated coords
addPoint("KS", target_coords_ecef);
// Connect "sat" to new point
createLine("sat2KS", "sat", "KS");
// Rotate 'sat' to buggy quaternion
rot("sat", satellite_bad_quat);

// %% Calculate pointing error
// Calculate angle between z-axis of 'sat' and 'sat2KS'
let angle_between_pointing_and_target = angle(
     "sat2KS", point("sat").frame.z
);
log(angle_between_pointing_and_target);

// Uncomment the code below to fix the orientation of the satellite
// and watch the scene from its point of view.

// // Add a camera wit a FOV of 50 degrees and switch to the satellite camera
// point("sat").addCamera(
//   {
//     fov: 50,
//     orientation: [0, 0, 0, 1],
//   }
// );
// switchCamera(point("sat").camera);
// // Point camera at the target
// let good_quat = findBestQuaternion(
//     point("sat").cameraBodyAxis.direction,
//     "y",
//     "sat->KS",
//     [0,0,1]
// );
// rot("sat", good_quat);
`;

// Store the decorations collection at module level so we can clear it between updates
let cellDecorations: monaco.editor.IEditorDecorationsCollection;

function highlightCells(editor: monaco.editor.IStandaloneCodeEditor): void {
  const model = editor.getModel();
  if (!model) {
    return;
  }

  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  const lines = model.getLinesContent();

  lines.forEach((line, index) => {
    if (line.trim().startsWith('// %%')) {
      decorations.push({
        range: new monaco.Range(index + 1, 1, index + 1, line.length + 1),
        options: {
          isWholeLine: true,
          className: 'cell-divider',
        },
      });
    }
  });

  // Clear previous decorations and set new ones
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (cellDecorations) {
    cellDecorations.clear();
  }
  cellDecorations = editor.createDecorationsCollection(decorations);
}

function findNextCellLine(
  editor: monaco.editor.IStandaloneCodeEditor,
  currentLine: number,
): Option<number> {
  const model = editor.getModel();
  if (!model) {
    return None;
  }

  const lines = model.getLinesContent();

  // First check if current line or next line is a cell marker
  if (
    currentLine < lines.length &&
    lines[currentLine].trim().startsWith('// %%')
  ) {
    return Some(currentLine + 1);
  }

  // Then search for next cell marker
  for (let i = currentLine + 1; i < lines.length; i++) {
    if (lines[i].trim().startsWith('// %%')) {
      return Some(i + 1);
    }
  }
  return None;
}

function getCurrentCell(editor: monaco.editor.IStandaloneCodeEditor): string {
  const model = editor.getModel();
  if (!model) {
    return '';
  }

  const position = editor.getPosition();
  if (!position) {
    return '';
  }

  const lines = model.getLinesContent();
  const currentCell: string[] = [];

  // Search backwards for cell boundary or start of file
  for (let i = position.lineNumber - 1; i >= 0; i--) {
    if (lines[i].trim().startsWith('// %%')) {
      break;
    }
    currentCell.unshift(lines[i]);
  }

  // Search forwards for cell boundary or end of file
  for (let i = position.lineNumber; i < lines.length; i++) {
    if (lines[i].trim().startsWith('// %%')) {
      break;
    }
    currentCell.push(lines[i]);
  }

  return currentCell.join('\n');
}

export function setupEditor(
  executeCommand: (command: string) => void,
  commands?: Record<string, CommandFunction>,
): monaco.editor.IStandaloneCodeEditor {
  const container = document.getElementById('editor-container');
  if (!container) {
    throw new Error('Editor container not found');
  }

  const isMac = /Mac/.test(navigator.userAgent);
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  function executeCell(): void {
    const cellContent = getCurrentCell(editor);
    executeCommand(cellContent.trim());

    const position = editor.getPosition();
    if (position) {
      const nextCellLine = findNextCellLine(editor, position.lineNumber);
      if (nextCellLine.some) {
        const line = nextCellLine.val;
        editor.setPosition({ lineNumber: line, column: 1 });
        editor.revealLineInCenter(line);
      }
    }
  }

  function executeScript(): void {
    executeCommand(editor.getValue().trim());
  }

  // Render editor template first
  render(editorTemplate(modifierKey, executeScript, executeCell), container);
  initLogger();

  const editorElement = document.getElementById('monaco-editor');
  if (!editorElement) {
    throw new Error('Monaco editor element not found');
  }

  // Configure Monaco editor
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
  });

  // Create editor with parameter hints enabled
  const editor = monaco.editor.create(editorElement, {
    value: satelliteScript,
    language: 'javascript',
    theme: 'vs-dark',
    minimap: { enabled: false },
    scrollbar: {
      vertical: 'hidden',
      horizontal: 'hidden',
    },
    parameterHints: {
      enabled: true,
      cycle: true,
    },
    inlayHints: {
      enabled: 'on',
    },
    // Add hover support
    hover: {
      enabled: true,
      delay: 300,
    },
    // Add quick suggestions
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
    suggestOnTriggerCharacters: true,
    // Disable snippets
    suggest: {
      snippetsPreventQuickSuggestions: false,
      showSnippets: false,
    },
  });

  // Setup cell highlighting
  editor.onDidChangeModelContent(() => highlightCells(editor));
  highlightCells(editor);

  // Add keyboard shortcuts
  editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, executeCell);

  editor.addCommand(
    (isMac ? monaco.KeyMod.WinCtrl : monaco.KeyMod.CtrlCmd) |
      monaco.KeyMod.Shift |
      monaco.KeyCode.Enter,
    executeScript,
  );

  // Register command completions if commands are provided
  if (commands) {
    registerCommandCompletions(commands);
  }

  return editor;
}
