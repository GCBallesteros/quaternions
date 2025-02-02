import { State } from '../types.js';
import { Point, OrientedPoint, Satellite } from '../point.js';

// Track expanded state of points
const expandedPoints = new Set<string>();

// Export for use in core.ts
export function removePointFromUI(pointName: string): void {
  const pointsList = document.getElementById('points-list');
  if (!pointsList) return;

  const pointElement = Array.from(pointsList.children).find(
    (el) => el.querySelector('.point-name')?.textContent === pointName
  );
  
  if (pointElement) {
    pointElement.remove();
    expandedPoints.delete(pointName);
  }
}

function createPointElement(
  name: string,
  type: string,
  point: Point,
): HTMLElement {
  const position = point.position;
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
          ? `
            <div>Quaternion: [${point.geometry.quaternion
              .toArray()
              .map((v) => v.toFixed(3))
              .join(', ')}]</div>
            ${
              type === 'Satellite'
                ? `<div>Orientation Mode: ${(point as any).orientationMode.type}
                   ${(point as any).orientationMode.type === 'dynamic' 
                     ? `<div style="margin-left: 10px;">
                        Primary: ${(point as any).orientationMode.primaryBodyVector} → ${
                          typeof (point as any).orientationMode.primaryTargetVector === 'object' 
                            ? (point as any).orientationMode.primaryTargetVector.type === 'TargetPointing'
                              ? `TargetPointing(${JSON.stringify((point as any).orientationMode.primaryTargetVector.target)})`
                              : (point as any).orientationMode.primaryTargetVector.type
                            : JSON.stringify((point as any).orientationMode.primaryTargetVector)
                        }<br>
                        Secondary: ${(point as any).orientationMode.secondaryBodyVector} → ${
                          typeof (point as any).orientationMode.secondaryTargetVector === 'object'
                            ? (point as any).orientationMode.secondaryTargetVector.type === 'TargetPointing'
                              ? `TargetPointing(${JSON.stringify((point as any).orientationMode.secondaryTargetVector.target)})`
                              : (point as any).orientationMode.secondaryTargetVector.type
                            : JSON.stringify((point as any).orientationMode.secondaryTargetVector)
                        }
                        </div>`
                     : `<div style="margin-left: 10px;">
                        Fixed quaternion: [${(point as any).orientationMode.ecef_quaternion.map((v: number) => v.toFixed(3)).join(', ')}]
                        </div>`
                   }</div>`
                : ''
            }
            ${
              (point as OrientedPoint).camera
                ? `<div>Camera: Present
                   <div style="margin-left: 10px;">Body Orientation: [${
                     (point as OrientedPoint).camera_orientation
                       ?.map((v) => v.toFixed(3))
                       ?.join(', ') ?? 'default'
                   }]</div>
                   </div>`
                : '<div>Camera: None</div>'
            }
          `
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
  point: Point,
): void {
  const typeElement = element.querySelector('.point-type');
  const detailsElement = element.querySelector('.point-details');
  const colorPicker = element.querySelector(
    '.color-picker',
  ) as HTMLInputElement;
  if (typeElement) typeElement.textContent = type;

  // Only update color picker if value is different from point's color
  const pointColor = point.color;
  if (colorPicker.value !== pointColor) {
    colorPicker.value = pointColor;
  }

  // Add color picker change handler if not already added
  if (!colorPicker.dataset.hasChangeHandler) {
    // if we listen to change we have a race condition because while we are
    // picking color the value of the picker gets set and it's not modified
    // after closing the picker. Anyways with input it's nicer and more dynamic
    colorPicker.addEventListener('input', () => {
      point.color = colorPicker.value;
    });
    colorPicker.dataset.hasChangeHandler = 'true';
  }

  const position = point.position;
  if (detailsElement) {
    detailsElement.innerHTML = `
      <div>Position: [${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)}]</div>
      ${
        type !== 'Point'
          ? `
            <div>Quaternion: [${point.geometry.quaternion
              .toArray()
              .map((v) => v.toFixed(3))
              .join(', ')}]</div>
            ${
              type === 'Satellite'
                ? `<div>Orientation Mode: ${(point as any).orientationMode.type}
                   ${(point as any).orientationMode.type === 'dynamic' 
                     ? `<div style="margin-left: 10px;">
                        Primary: ${(point as any).orientationMode.primaryBodyVector} → ${
                          typeof (point as any).orientationMode.primaryTargetVector === 'object' 
                            ? (point as any).orientationMode.primaryTargetVector.type === 'TargetPointing'
                              ? `TargetPointing(${JSON.stringify((point as any).orientationMode.primaryTargetVector.target)})`
                              : (point as any).orientationMode.primaryTargetVector.type
                            : JSON.stringify((point as any).orientationMode.primaryTargetVector)
                        }<br>
                        Secondary: ${(point as any).orientationMode.secondaryBodyVector} → ${
                          typeof (point as any).orientationMode.secondaryTargetVector === 'object'
                            ? (point as any).orientationMode.secondaryTargetVector.type === 'TargetPointing'
                              ? `TargetPointing(${JSON.stringify((point as any).orientationMode.secondaryTargetVector.target)})`
                              : (point as any).orientationMode.secondaryTargetVector.type
                            : JSON.stringify((point as any).orientationMode.secondaryTargetVector)
                        }
                        </div>`
                     : `<div style="margin-left: 10px;">
                        Fixed quaternion: [${(point as any).orientationMode.ecef_quaternion.map((v: number) => v.toFixed(3)).join(', ')}]
                        </div>`
                   }</div>`
                : ''
            }
            ${
              (point as OrientedPoint).camera
                ? `<div>Camera: Present
                   <div style="margin-left: 10px;">Body Orientation: [${
                     (point as OrientedPoint).camera_orientation
                       ?.map((v) => v.toFixed(3))
                       ?.join(', ') ?? 'default'
                   }]</div>
                   </div>`
                : '<div>Camera: None</div>'
            }
          `
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

    let type = 'Point';
    if (point instanceof Satellite) {
      type = 'Satellite';
    } else if (point instanceof OrientedPoint) {
      type = 'OrientedPoint';
    }

    if (!pointElement) {
      pointElement = createPointElement(name, type, point);
      pointsList.appendChild(pointElement);
    } else {
      updatePointElement(pointElement, type, state.points[name]);
    }
  });
}
