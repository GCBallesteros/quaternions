import { WebGLRenderer } from 'three';
import { State } from './types.js';
import { setupBodiesTab } from './ui/bodies.js';
import { setupEditor } from './ui/editor.js';
import { setupLighting as setupSettings } from './ui/settings.js';
import { setupPlotsTab } from './ui/plots.js';
import { setupResizer } from './ui/resize.js';
import { setupTabs } from './ui/tabs.js';

export function setupUI(
  state: State,
  executeCommand: (command: string) => void,
  renderer: WebGLRenderer,
): void {
  const editor = setupEditor(executeCommand);
  setupTabs(editor);
  setupSettings(state, executeCommand);
  setupResizer(editor, renderer, state);
  setupBodiesTab(state);
  setupPlotsTab(state);
}
