import { _toggleSimTime } from '../core';
import { State } from '../types';

export function setupTimeControls(state: State) {
  const timeToggle = document.getElementById('time-toggle') as HTMLButtonElement;
  
  timeToggle.addEventListener('click', () => {
    const result = _toggleSimTime(state);
    if (result.ok) {
      timeToggle.classList.toggle('playing');
      timeToggle.setAttribute('aria-label', 
        state.isTimeFlowing ? 'Pause simulation' : 'Play simulation'
      );
    }
  });

  // Set initial state
  if (state.isTimeFlowing) {
    timeToggle.classList.add('playing');
    timeToggle.setAttribute('aria-label', 'Pause simulation');
  }
}
