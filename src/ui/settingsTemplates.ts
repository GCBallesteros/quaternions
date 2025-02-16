import { html } from 'lit-html';
import { State } from '../types.js';
import { utcDate } from '../utils.js';

import { createTimeInput } from './timeInput.js';

export const timeTemplate = (
  currentTime: Date,
  onTimeUpdate: () => void,
) => html`
  <div class="settings-group">
    <h3>UTC Time</h3>
    <div id="current-time">${currentTime.toISOString()}</div>
    ${createTimeInput(currentTime)}
    <button id="update-time" @click=${onTimeUpdate}>Update Time</button>
  </div>
`;

export const lightingTemplate = (
  sunVisible: boolean,
  ambientIntensity: number,
) => html`
  <div class="settings-group">
    <h3>Lighting</h3>
    <div class="control-row">
      <div class="switch-container">
        <label class="switch">
          <input
            type="checkbox"
            id="sun-toggle"
            ?checked=${sunVisible}
            @change=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const event = new CustomEvent('sun-toggle-change', {
                detail: { checked: target.checked },
              });
              document.dispatchEvent(event);
            }}
          />
          <span class="slider round"></span>
        </label>
        <span class="switch-label">Sun Light</span>
      </div>
    </div>
    <div class="control-row">
      <div class="range-control">
        <div class="range-header">
          <label for="ambient-intensity">Ambient Light</label>
          <span class="range-value">${ambientIntensity.toFixed(2)}</span>
        </div>
        <input
          type="range"
          id="ambient-intensity"
          min="0"
          max="1"
          step="0.05"
          .value=${ambientIntensity.toString()}
          @input=${(e: Event) => {
            const target = e.target as HTMLInputElement;
            const event = new CustomEvent('ambient-intensity-change', {
              detail: { value: parseFloat(target.value) },
            });
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
) => html`
  // AI! Refactor this function to a function
  ${timeTemplate(state.currentTime, () => {
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
      console.log(dateResult.val);
    }
  })}
  ${lightingTemplate(state.lights.sun.visible, state.lights.ambient.intensity)}
`;
