import * as THREE from 'three';
import {
  NamedTargets,
  OrientedPoint,
  Satellite,
} from '../points/orientedPoint.js';
import { Point } from '../points/point.js';
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

function generatePointHTML(name: string, type: string, point: Point): string {
  const position = point.position;
  return `
    <div class="point-header">
      <span class="expand-button">▶</span>
      <input type="color" class="color-picker" value="${point.color}" title="Point color">
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
      ${generatePointDetails(type, point)}
    </div>
  `;
}

function generatePointDetails(type: string, point: Point): string {
  const position = point.position;
  return `
    <div>Position: [${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)}]</div>
    ${
      type !== 'Point'
        ? `
          <div>Quaternion: [${point.geometry.quaternion
            .toArray()
            .map((v) => v.toFixed(3))
            .join(', ')}]</div>
          ${generateOrientationDetails(type, point)}
        `
        : ''
    }
  `;
}

function generateOrientationDetails(type: string, point: Point): string {
  if (type === 'Satellite') {
    return `
      <div>Orientation Mode: ${(point as any).orientationMode.type}
        ${
          (point as any).orientationMode.type === 'dynamic'
            ? `<div style="margin-left: 10px;">
              Primary: ${(point as any).orientationMode.primaryBodyVector} → ${formatTargetVector((point as any).orientationMode.primaryTargetVector)}<br>
              Secondary: ${(point as any).orientationMode.secondaryBodyVector} → ${formatTargetVector((point as any).orientationMode.secondaryTargetVector)}
              </div>`
            : `<div style="margin-left: 10px;">
              Fixed quaternion: [${(point as any).orientationMode.ecef_quaternion.map((v: number) => v.toFixed(3)).join(', ')}]
              </div>`
        }
      </div>
      ${generateCameraDetails(point as OrientedPoint)}
    `;
  }
  return generateCameraDetails(point as OrientedPoint);
}

function generateCameraDetails(point: OrientedPoint): string {
  return point.camera
    ? `<div>Camera: Present
       <div style="margin-left: 10px;">Body Orientation: [${
         point.camera_orientation?.map((v) => v.toFixed(3))?.join(', ') ??
         'default'
       }]</div>
       </div>`
    : '<div>Camera: None</div>';
}

function setupTrailToggle(element: HTMLElement, point: Satellite): void {
  const trailSwitch = element.querySelector(
    '.trail-switch',
  ) as HTMLInputElement;
  if (!trailSwitch) return;

  trailSwitch.addEventListener('change', () => {
    if (trailSwitch.checked) {
      if (!point.hasTrail && point.camera) {
        point.trail = new Trail(
          point.geometry,
          point.geometry.position,
          point.geometry.parent as THREE.Scene,
        );
        point.hasTrail = true;
      }
    } else {
      if (point.trail) {
        point.trail.dispose();
        point.trail = null;
        point.hasTrail = false;
      }
    }
  });
}

function setupColorPicker(element: HTMLElement, point: Point): void {
  const colorPicker = element.querySelector(
    '.color-picker',
  ) as HTMLInputElement;
  if (!colorPicker) return;

  // Only update color picker if value is different from point's color
  const pointColor = point.color;
  if (colorPicker.value !== pointColor) {
    colorPicker.value = pointColor;
  }

  // Add color picker change handler if not already added
  if (!colorPicker.dataset.hasChangeHandler) {
    colorPicker.addEventListener('input', () => {
      point.color = colorPicker.value;
    });
    colorPicker.dataset.hasChangeHandler = 'true';
  }
}

function setupExpandButton(element: HTMLElement, name: string): void {
  const expandButton = element.querySelector('.expand-button');
  const details = element.querySelector('.point-details');

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
}

function createPointElement(
  name: string,
  type: string,
  point: Point,
): HTMLElement {
  const pointElement = document.createElement('div');
  pointElement.className = 'point-item';
  pointElement.innerHTML = generatePointHTML(name, type, point);

  setupExpandButton(pointElement, name);
  setupColorPicker(pointElement, point);

  if (type === 'Satellite') {
    setupTrailToggle(pointElement, point as Satellite);
  }

  return pointElement;
}

function updatePointElement(
  element: HTMLElement,
  name: string,
  type: string,
  point: Point,
): void {
  element.innerHTML = generatePointHTML(name, type, point);

  setupExpandButton(element, name);
  setupColorPicker(element, point);

  if (type === 'Satellite') {
    setupTrailToggle(element, point as Satellite);
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
      updatePointElement(pointElement, name, type, state.points[name]);
    }
  });
}
