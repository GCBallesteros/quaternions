import * as THREE from 'three';
import { NamedTargets, OrientedPoint, Point, Satellite } from '../point.js';
import { Trail } from '../trail.js';
import { State, Vector3 } from '../types.js';

function formatTargetVector(target: Vector3 | NamedTargets): string {
  if (typeof target === 'object' && target !== null && 'type' in target) {
    if (target.type === 'TargetPointing') {
      return `TargetPointing(${JSON.stringify(target.target)})`;
    }
    return target.type;
  }
  return JSON.stringify(target);
}

// Track expanded state of points
const expandedPoints = new Set<string>();

// Export for use in core.ts
export function removePointFromUI(pointName: string): void {
  const pointsList = document.getElementById('points-list');
  if (!pointsList) return;

  const pointElement = Array.from(pointsList.children).find(
    (el) => el.querySelector('.point-name')?.textContent === pointName,
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
      ${
        type === 'Satellite' && (point as OrientedPoint).camera
          ? `<div class="trail-toggle">
               <label class="switch">
                 <input type="checkbox" class="trail-switch" ${(point as Satellite).hasTrail ? 'checked' : ''}>
                 <span class="slider"></span>
               </label>
               <span class="camera-icon ${(point as OrientedPoint).camera ? 'active' : ''}">📷</span>
             </div>`
          : ''
      }
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
                   ${
                     (point as any).orientationMode.type === 'dynamic'
                       ? `<div style="margin-left: 10px;">
                        Primary: ${(point as any).orientationMode.primaryBodyVector} → ${formatTargetVector((point as any).orientationMode.primaryTargetVector)}<br>
                        Secondary: ${(point as any).orientationMode.secondaryBodyVector} → ${formatTargetVector((point as any).orientationMode.secondaryTargetVector)}
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
            <div class="point-controls">
            </div>
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

  // Add trail toggle handler for satellites
  if (type === 'Satellite') {
    const trailSwitch = pointElement.querySelector(
      '.trail-switch',
    ) as HTMLInputElement;
    trailSwitch.addEventListener('change', () => {
      const satellite = point as Satellite;
      if (trailSwitch.checked) {
        if (!satellite.hasTrail && satellite.camera) {
          satellite.trail = new Trail(
            satellite.geometry,
            satellite.geometry.position,
            satellite.geometry.parent as THREE.Scene,
          );
          satellite.hasTrail = true;
        }
      } else {
        if (satellite.trail) {
          satellite.trail.dispose();
          satellite.trail = null;
          satellite.hasTrail = false;
        }
      }
    });
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
    // Store the previous trail switch state if it exists
    const previousTrailSwitch = element.querySelector(
      '.trail-switch',
    ) as HTMLInputElement;
    const wasChecked = previousTrailSwitch?.checked;

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
                   ${
                     (point as any).orientationMode.type === 'dynamic'
                       ? `<div style="margin-left: 10px;">
                        Primary: ${(point as any).orientationMode.primaryBodyVector} → ${formatTargetVector((point as any).orientationMode.primaryTargetVector)}<br>
                        Secondary: ${(point as any).orientationMode.secondaryBodyVector} → ${formatTargetVector((point as any).orientationMode.secondaryTargetVector)}
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

    // Restore trail switch functionality if this is a satellite
    if (type === 'Satellite') {
      const trailSwitch = element.querySelector(
        '.trail-switch',
      ) as HTMLInputElement;
      if (trailSwitch) {
        // Restore previous state if it existed
        if (wasChecked !== undefined) {
          trailSwitch.checked = wasChecked;
        }

        // Remove old listener and add new one
        const newTrailSwitch = element.querySelector(
          '.trail-switch',
        ) as HTMLInputElement;
        newTrailSwitch.addEventListener('change', () => {
          const satellite = point as Satellite;
          if (newTrailSwitch.checked) {
            satellite.hasTrail = true;
            if (!satellite.trail && satellite.camera) {
              satellite.trail = new Trail(
                satellite.geometry,
                satellite.geometry.position,
                satellite.geometry.parent as THREE.Scene,
              );
            }
          } else {
            satellite.hasTrail = false;
            if (satellite.trail) {
              satellite.trail.dispose();
              satellite.trail = null;
            }
          }
        });
      }
    }
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
