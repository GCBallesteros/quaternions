import { html, render } from 'lit-html';
import { _toggleSimTime } from '../core.js';
import { State } from '../types.js';

function formatSpeed(timeSpeedMultiplier: number): string {
  const absSpeed = Math.abs(timeSpeedMultiplier);
  if (absSpeed === 0) return 'Paused';
  if (absSpeed < 1) return `${timeSpeedMultiplier.toFixed(2)}x`;
  if (absSpeed < 10) return `${timeSpeedMultiplier.toFixed(1)}x`;
  return `${Math.round(timeSpeedMultiplier)}x`;
}

function timeControlsTemplate(
  state: State,
  handleTimeToggle: () => void,
  handleSpeedChange: (e: Event) => void,
) {
  return html`
    <button
      class="play-pause-btn ${state.isTimeFlowing ? 'playing' : ''}"
      @click=${handleTimeToggle}
      aria-label=${state.isTimeFlowing ? 'Pause simulation' : 'Play simulation'}
    ></button>
    <div class="slider-wrapper">
      <div class="slider-marker"></div>
      <input
        type="range"
        min="-1000"
        max="1000"
        value="100"
        step="1"
        class="time-slider"
        @input=${handleSpeedChange}
      />
    </div>
    <div id="time-speed-display">${formatSpeed(state.timeSpeedMultiplier)}</div>
  `;
}

export function setupTimeControls(state: State): void {
  const container = document.getElementById('time-controls');
  if (!container) return;

  function handleTimeToggle() {
    const result = _toggleSimTime(state);
    if (result.ok) {
      renderTimeControls();
    }
  }

  function handleSpeedChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (value === 0) {
      state.timeSpeedMultiplier = 0;
    } else {
      const sign = Math.sign(value);
      const magnitude = Math.abs(value);
      const logSpeed = Math.exp(Math.log(1000) * (magnitude / 1000));
      state.timeSpeedMultiplier = sign * logSpeed;
    }
    renderTimeControls();
  }

  function renderTimeControls() {
    if (!container) return;
    render(
      timeControlsTemplate(state, handleTimeToggle, handleSpeedChange),
      container,
    );
  }

  // Initial render
  renderTimeControls();
}
