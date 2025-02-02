import { _toggleSimTime } from '../core.js';
import { State } from '../types.js';

function formatSpeed(timeSpeedMultiplier: number): string {
  const absSpeed = Math.abs(timeSpeedMultiplier);
  let speedText = '';
  if (absSpeed === 0) {
    speedText = 'Paused';
  } else if (absSpeed < 1) {
    speedText = `${timeSpeedMultiplier.toFixed(2)}x`;
  } else if (absSpeed < 10) {
    speedText = `${timeSpeedMultiplier.toFixed(1)}x`;
  } else {
    speedText = `${Math.round(timeSpeedMultiplier)}x`;
  }

  return speedText;
}

export function updateTimeControlUI(
  isFlowing: boolean,
  timeToggle: HTMLButtonElement,
) {
  if (isFlowing) {
    timeToggle.classList.add('playing');
    timeToggle.setAttribute('aria-label', 'Pause simulation');
  } else {
    timeToggle.classList.remove('playing');
    timeToggle.setAttribute('aria-label', 'Play simulation');
  }
}

export function setupTimeControls(state: State) {
  const timeToggleButton = document.getElementById(
    'time-toggle',
  ) as HTMLButtonElement;
  const timeSlider = document.getElementById('time-speed') as HTMLInputElement;

  timeToggleButton.addEventListener('click', () => {
    const result = _toggleSimTime(state);
    if (result.ok) {
      updateTimeControlUI(result.val, timeToggleButton);
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
    timeToggleButton.classList.add('playing');
    timeToggleButton.setAttribute('aria-label', 'Pause simulation');
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
