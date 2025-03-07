import { render } from 'lit-html';

import { State } from '../types.js';

import { settingsTemplate } from './settingsTemplates.js';

export function setupLighting(
  state: State,
  executeCommand: (command: string) => void,
): void {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const settingsContainer = document.getElementById('settings-container')!;

  // Setup event listeners
  document.addEventListener('sun-toggle-change', ((
    e: CustomEvent<{ checked: boolean }>,
  ) => {
    state.lights.sun.visible = e.detail.checked;
  }) as EventListener);

  document.addEventListener('ambient-intensity-change', ((
    e: CustomEvent<{ value: number }>,
  ) => {
    state.lights.ambient.intensity = e.detail.value;
  }) as EventListener);

  function updateSettings(): void {
    render(settingsTemplate(state, executeCommand), settingsContainer);
  }

  // Initial render
  updateSettings();

  // Setup periodic updates
  setInterval(updateSettings, 250);
}
