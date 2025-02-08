import { WebGLRenderer } from 'three';
import { State } from './types.js';
import { createTimeInput } from './components/timeInput.js';
import { setupEditor } from './ui/editor.js';
import { setupTabs } from './ui/tabs.js';
import { setupLighting } from './ui/lighting.js';
import { setupResizer } from './ui/resize.js';
import { setupBodiesTab } from './ui/bodies.js';

export function updateTimeDisplay(state: State) {
  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    timeElement.textContent = state.currentTime.toISOString();
  }
}

export function setupUI(
  state: State,
  executeCommand: (command: string) => void,
  renderer: WebGLRenderer,
): void {
  const editor = setupEditor(executeCommand);
  setupTabs(editor);
  setupLighting(state);
  setupResizer(editor, renderer, state);
  setupBodiesTab(state);
  // Setup time input
  const timeGroup = document.querySelector('.settings-group')!;
  const timeInput = createTimeInput();
  timeGroup.appendChild(timeInput);

  // Initialize with current simulation time
  const dateInput = document.getElementById('sim-date') as HTMLInputElement;
  const hoursInput = document.getElementById('sim-hours') as HTMLInputElement;
  const minutesInput = document.getElementById(
    'sim-minutes',
  ) as HTMLInputElement;
  const secondsInput = document.getElementById(
    'sim-seconds',
  ) as HTMLInputElement;

  const currentTime = state.currentTime;
  dateInput.value = currentTime.toISOString().split('T')[0];
  hoursInput.value = currentTime.getUTCHours().toString().padStart(2, '0');
  minutesInput.value = currentTime.getUTCMinutes().toString().padStart(2, '0');
  secondsInput.value = currentTime.getUTCSeconds().toString().padStart(2, '0');

  // Setup update button
  const updateButton = document.getElementById('update-time');
  updateButton?.addEventListener('click', () => {
    const dateComponents = dateInput.value.split('-').map((n) => parseInt(n));
    const dateResult = utcDate(
      dateComponents[0],
      dateComponents[1],
      dateComponents[2],
      parseInt(hoursInput.value),
      parseInt(minutesInput.value),
      parseInt(secondsInput.value),
    );

    if (dateResult.ok) {
      executeCommand(`setTime(new Date("${dateResult.val.toISOString()}"))`);
    } else {
      log(dateResult.val);
    }
  });
}
