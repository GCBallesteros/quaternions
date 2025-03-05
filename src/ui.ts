import { WebGLRenderer } from 'three';

import { _hideSecondaryView } from './core.js';
import { CommandFunction, State } from './types.js';
import { setupBodiesTab } from './ui/bodies.js';
import { setupEditor } from './ui/editor.js';
import { setupPlotsTab } from './ui/plots.js';
import { setupResizer } from './ui/resize.js';
import { setupLighting as setupSettings } from './ui/settings.js';
import { setupGlobalShortcuts } from './ui/shortcuts.js';
import { setupTabs } from './ui/tabs.js';

export function setupUI(
  state: State,
  executeCommand: (command: string) => void,
  renderer: WebGLRenderer,
  commands?: Record<string, CommandFunction>,
): void {
  const editor = setupEditor(executeCommand, commands);
  setupGlobalShortcuts(editor);
  setupTabs(editor);
  setupSettings(state, executeCommand);
  setupResizer(editor, renderer, state);
  setupBodiesTab(state);
  setupPlotsTab(state);

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.id = 'close-button-sec-view';
  closeButton.onclick = _hideSecondaryView;

  const secondaryView = document.getElementById('secondary-view');
  if (secondaryView) {
    secondaryView.appendChild(closeButton);
  }
}
