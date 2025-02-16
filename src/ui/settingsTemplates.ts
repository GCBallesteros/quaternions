import { html } from 'lit-html';
import { State } from '../types.js';

export const timeTemplate = (currentTime: string) => html`
  <div class="settings-group">
    <h3>UTC Time</h3>
    <div id="current-time">${currentTime}</div>
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

export const settingsTemplate = (state: State) => html`
  ${timeTemplate(state.currentTime.toISOString())}
  ${lightingTemplate(state.lights.sun.visible, state.lights.ambient.intensity)}
`;
