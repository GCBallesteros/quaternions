import { State } from '../types.js';
import { OrientedPoint, Satellite } from '../point.js';
import { Vector3 } from '../types.js';

// Track expanded state of points
const expandedPoints = new Set<string>();

function createPointElement(
  name: string,
  type: string,
  position: Vector3,
): HTMLElement {
  const pointElement = document.createElement('div');
  pointElement.className = 'point-item';
  pointElement.innerHTML = `
    <div class="point-header">
      <span class="expand-button">▶</span>
      <span class="point-name">${name}</span>
      <span class="point-type">${type}</span>
    </div>
    <div class="point-details">
      Position: [${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)}]
    </div>
  `;

  const expandButton = pointElement.querySelector('.expand-button');
  const details = pointElement.querySelector('.point-details');

  expandButton?.addEventListener('click', () => {
    if (expandButton.classList.contains('expanded')) {
      expandedPoints.delete(name);
    } else {
      expandedPoints.add(name);
    }
    expandButton.classList.toggle('expanded');
    details?.classList.toggle('expanded');
  });

  if (expandedPoints.has(name)) {
    expandButton?.classList.add('expanded');
    details?.classList.add('expanded');
  }

  return pointElement;
}

function updatePointElement(
  element: HTMLElement,
  type: string,
  position: Vector3,
): void {
  const typeElement = element.querySelector('.point-type');
  const detailsElement = element.querySelector('.point-details');
  if (typeElement) typeElement.textContent = type;
  if (detailsElement) {
    detailsElement.textContent = `Position: [${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)}]`;
  }
}

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
  setInterval(() => updatePointsList(state), 250);
}

function updatePointsList(state: State): void {
  const pointsList = document.getElementById('points-list')!;
  const currentPoints = new Set(Object.keys(state.points));

  // Remove elements for points that no longer exist
  Array.from(pointsList.children).forEach((element) => {
    const name = element.querySelector('.point-name')?.textContent;
    if (name && !currentPoints.has(name)) {
      element.remove();
      expandedPoints.delete(name);
    }
  });

  // Update or create elements for current points
  Object.entries(state.points).forEach(([name, point]) => {
    let pointElement = Array.from(pointsList.children).find(
      (el) => el.querySelector('.point-name')?.textContent === name,
    ) as HTMLElement;

    const position = point.position;
    let type = 'Point';
    if (point instanceof Satellite) {
      type = 'Satellite';
    } else if (point instanceof OrientedPoint) {
      type = 'OrientedPoint';
    }

    if (!pointElement) {
      pointElement = createPointElement(name, type, position);
      pointsList.appendChild(pointElement);
    } else {
      updatePointElement(pointElement, type, position);
    }
  });
}
