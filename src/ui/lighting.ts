import { State } from '../types.js';
import { createRangeInput } from '../components/rangeInput.js';

export function setupLighting(state: State): void {
  // Setup sun light toggle
  const sunToggle = document.getElementById('sun-toggle') as HTMLInputElement;
  sunToggle.addEventListener('change', () => {
    state.lights.sun.visible = sunToggle.checked;
  });

  // Setup ambient light intensity control
  const rangeInput = createRangeInput(
    'Ambient Light',
    'ambient-intensity',
    '0',
    '1',
    '0.05',
    '0.2',
    (value: number) => {
      state.lights.ambient.intensity = value;
    },
  );

  const lightingGroup = document.querySelector('.settings-group:nth-child(2)');
  if (lightingGroup) {
    lightingGroup.appendChild(rangeInput);
  }
}
