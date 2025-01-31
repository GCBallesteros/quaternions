import { State } from '../types.js';
import { OrientedPoint, Satellite } from '../point.js';
import { Vector3 } from '../types.js';

// Track expanded state of points
const expandedPoints = new Set<string>();

// AI! Since we are passing the point we don't need to pass the position that can be deduced from point
function createPointElement(
  name: string,
  type: string,
  position: Vector3,
  point: OrientedPoint | Satellite,
): HTMLElement {
  const pointElement = document.createElement('div');
  pointElement.className = 'point-item';
  pointElement.innerHTML = `
    <div class="point-header">
      <span class="expand-button">▶</span>
      <input type="color" class="color-picker" value="#ffffff" title="Point color">
      <span class="point-name">${name}</span>
      <span class="point-type">${type}</span>
    </div>
    <div class="point-details">
      <div>Position: [${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)}]</div>
      ${
        type !== 'Point'
          ? `<div>Quaternion: [${point.geometry.quaternion
              .toArray()
              .map((v) => v.toFixed(3))
              .join(', ')}]</div>`
          : ''
      }
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
  state: State,
  name: string,
): void {
  const typeElement = element.querySelector('.point-type');
  const detailsElement = element.querySelector('.point-details');
  const colorPicker = element.querySelector(
    '.color-picker',
  ) as HTMLInputElement;
  if (typeElement) typeElement.textContent = type;

  // Only update color picker if value is different from point's color
  const pointColor = state.points[name].color;
  if (colorPicker.value !== pointColor) {
    colorPicker.value = pointColor;
  }

  // Add color picker change handler if not already added
  if (!colorPicker.dataset.hasChangeHandler) {
    // if we listen to change we have a race condition because while we are
    // picking color the value of the picker gets set and it's not modified
    // after closing the picker. Anyways with input it's nicer and more dynamic
    colorPicker.addEventListener('input', () => {
      state.points[name].color = colorPicker.value;
    });
    colorPicker.dataset.hasChangeHandler = 'true';
  }
  if (detailsElement) {
    const point = state.points[name];
    detailsElement.innerHTML = `
      <div>Position: [${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)}]</div>
      ${
        type !== 'Point'
          ? `<div>Quaternion: [${point.geometry.quaternion
              .toArray()
              .map((v) => v.toFixed(3))
              .join(', ')}]</div>`
          : ''
      }
    `;
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
      // AI! We don't need to pass position because it can be deduced from point
      pointElement = createPointElement(name, type, position, point);
      pointsList.appendChild(pointElement);
    } else {
      updatePointElement(pointElement, type, position, state, name);
    }
  });
}
