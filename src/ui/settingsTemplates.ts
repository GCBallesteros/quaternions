import { html, TemplateResult } from 'lit-html';

import { State } from '../types.js';
import { utcDate } from '../utils.js';

import { commonStyles } from './styles/common.js';
import { settingsStyles } from './styles/settings.js';
import { createTimeInput } from './timeInput.js';

function handleTimeUpdate(executeCommand: (command: string) => void): void {
  const dateInput = document.getElementById('sim-date') as HTMLInputElement;
  const hoursInput = document.getElementById('sim-hours') as HTMLInputElement;
  const minutesInput = document.getElementById(
    'sim-minutes',
  ) as HTMLInputElement;
  const secondsInput = document.getElementById(
    'sim-seconds',
  ) as HTMLInputElement;

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
    console.error(dateResult.val);
  }
}

export const timeTemplate = (
  currentTime: Date,
  onTimeUpdate: () => void,
): TemplateResult<1> => html`
  <div class=${settingsStyles.group}>
    <h3 class=${commonStyles.sectionTitle}>UTC Time</h3>
    <div id="current-time" class=${settingsStyles.currentTime}>
      ${currentTime.toISOString()}
    </div>
    ${createTimeInput(currentTime)}
    <button
      id="update-time"
      class=${settingsStyles.button}
      @click=${onTimeUpdate}
    >
      Update Time
    </button>
  </div>
`;

export const lightingTemplate = (
  sunVisible: boolean,
  ambientIntensity: number,
): TemplateResult<1> => html`
  <div class=${settingsStyles.group}>
    <h3 class=${commonStyles.sectionTitle}>Lighting</h3>
    <div>
      <div class=${settingsStyles.switchContainer}>
        <label class=${commonStyles.toggle.label}>
          <input
            type="checkbox"
            id="sun-toggle"
            class=${commonStyles.toggle.input}
            ?checked=${sunVisible}
            @change=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const event = new CustomEvent<{ checked: boolean }>(
                'sun-toggle-change',
                {
                  detail: { checked: target.checked },
                },
              );
              document.dispatchEvent(event);
            }}
          />
          <div class=${commonStyles.toggle.slider}></div>
        </label>
        <span class=${settingsStyles.switchLabel}>Sun Light</span>
      </div>
    </div>
    <div>
      <div class=${settingsStyles.rangeControl.container}>
        <div class=${settingsStyles.rangeControl.header}>
          <label for="ambient-intensity">Ambient Light</label>
          <span>${ambientIntensity.toFixed(2)}</span>
        </div>
        <input
          type="range"
          id="ambient-intensity"
          class=${settingsStyles.rangeControl.input}
          min="0"
          max="1"
          step="0.05"
          .value=${ambientIntensity.toString()}
          @input=${(e: Event) => {
            const target = e.target as HTMLInputElement;
            const event = new CustomEvent<{ value: number }>(
              'ambient-intensity-change',
              {
                detail: { value: parseFloat(target.value) },
              },
            );
            document.dispatchEvent(event);
          }}
        />
      </div>
    </div>
  </div>
`;

export const settingsTemplate = (
  state: State,
  executeCommand: (command: string) => void,
): TemplateResult<1> => html`
  ${timeTemplate(state.currentTime, () => handleTimeUpdate(executeCommand))}
  ${lightingTemplate(state.lights.sun.visible, state.lights.ambient.intensity)}
`;
