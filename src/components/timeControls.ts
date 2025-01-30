import { _toggleSimTime } from '../core.js';
import { State } from '../types.js';

function formatSpeed(timeSpeedMultiplier: number): string {
  const absSpeed = Math.abs(timeSpeedMultiplier);
  let speedText = '';
  if (absSpeed === 0) {
    speedText = 'Paused';
  } else if (absSpeed < 1) {
    speedText = `${absSpeed.toFixed(2)}x`;
  } else if (absSpeed < 10) {
    speedText = `${absSpeed.toFixed(1)}x`;
  } else {
    speedText = `${Math.round(absSpeed)}x`;
  }

  return speedText;
}

export function setupTimeControls(state: State) {
  const timeToggle = document.getElementById(
    'time-toggle',
  ) as HTMLButtonElement;
  const timeSlider = document.getElementById('time-speed') as HTMLInputElement;

  timeToggle.addEventListener('click', () => {
    const result = _toggleSimTime(state);
    if (result.ok) {
      timeToggle.classList.toggle('playing');
      timeToggle.setAttribute(
        'aria-label',
        state.isTimeFlowing ? 'Pause simulation' : 'Play simulation',
      );
    }
  });

  timeSlider.addEventListener('input', (e) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    // Convert linear slider value to logarithmic speed
    if (value === 0) {
      state.timeSpeedMultiplier = 0;
    } else {
      const sign = Math.sign(value);
      const magnitude = Math.abs(value);
      // Map 1-1000 to 1-1000 logarithmically
      const logSpeed = Math.exp(Math.log(1000) * (magnitude / 1000));
      state.timeSpeedMultiplier = sign * logSpeed;
    }

    // Update speed display
    const speedDisplay = document.getElementById('time-speed-display');
    if (speedDisplay) {
      const speedText = formatSpeed(state.timeSpeedMultiplier);
      speedDisplay.textContent = speedText;
    }
  });

  // Set initial state
  if (state.isTimeFlowing) {
    timeToggle.classList.add('playing');
    timeToggle.setAttribute('aria-label', 'Pause simulation');
  }

  // Set initial speed multiplier
  const initialValue = parseInt(timeSlider.value);
  if (initialValue !== 0) {
    const magnitude = Math.abs(initialValue);
    const logSpeed = Math.exp(Math.log(1000) * (magnitude / 1000));
    state.timeSpeedMultiplier = Math.sign(initialValue) * logSpeed;
  }

  // Set initial speed display
  const speedDisplay = document.getElementById('time-speed-display');
  if (speedDisplay) {
    const speedText = formatSpeed(state.timeSpeedMultiplier);
    speedDisplay.textContent = speedText;
    speedDisplay.textContent = speedText;
  }
}
