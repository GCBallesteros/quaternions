import { State } from '../types.js';
import { Point, OrientedPoint, Satellite } from '../point.js';

export function setupBodiesTab(state: State): void {
  const bodiesContainer = document.getElementById('bodies-container')!;

  // Create points section
  const pointsGroup = document.createElement('div');
  pointsGroup.className = 'settings-group';
  pointsGroup.innerHTML = `
    <h3>Points</h3>
    <div id="points-list"></div>
  `;
  bodiesContainer.appendChild(pointsGroup);

  // Initial render of points
  updatePointsList(state);

  // Setup periodic updates
  setInterval(() => updatePointsList(state), 1000);
}

function updatePointsList(state: State): void {
  const pointsList = document.getElementById('points-list')!;
  pointsList.innerHTML = '';

  Object.entries(state.points).forEach(([name, point]) => {
    const pointElement = document.createElement('div');
    pointElement.className = 'point-item';

    // Determine point type
    let type = 'Point';
    if (point instanceof Satellite) {
      type = 'Satellite';
    } else if (point instanceof OrientedPoint) {
      type = 'OrientedPoint';
    }

    pointElement.innerHTML = `
      <span class="point-name">${name}</span>
      <span class="point-type">${type}</span>
    `;
    pointsList.appendChild(pointElement);
  });
}
