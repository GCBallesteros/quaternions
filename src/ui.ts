import {State} from './types.js'

// Update current time display
export function updateTimeDisplay(state: State) {
  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    timeElement.textContent = state.currentTime.toLocaleString();
  }
}
