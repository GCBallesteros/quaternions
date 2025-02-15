import { html } from 'lit-html';
import { Point, OrientedPoint } from '../points/orientedPoint.js';
import { Satellite, NamedTargets } from '../points/satellite.js';
import { Vector3 } from '../types.js';

function formatTargetVector(target: Vector3 | NamedTargets): string {
  if (typeof target === 'object' && target !== null && 'type' in target) {
    if (target.type === 'TargetPointing') {
      return `TargetPointing(${JSON.stringify(target.target)})`;
    }
    return target.type;
  }
  return JSON.stringify(target);
}

export const pointTemplate = (name: string, type: string, point: Point) => html`
  <div class="point-header">
    <span class="expand-button">▶</span>
    <input
      type="color"
      class="color-picker"
      value="${point.color}"
      title="Point color"
    />
    <span class="point-name">${name}</span>
    ${type === 'Satellite' && (point as OrientedPoint).camera
      ? html`
          <div class="trail-toggle">
            <label class="switch">
              <input
                type="checkbox"
                class="trail-switch"
                ?checked=${(point as Satellite).hasTrail}
              />
              <span class="slider"></span>
            </label>
            <span class="camera-icon active">📷</span>
          </div>
        `
      : ''}
    <span class="point-type">${type}</span>
  </div>
  <div class="point-details">
    <div>Position: [${point.position.map((v) => v.toFixed(2)).join(', ')}]</div>
    ${type !== 'Point'
      ? html`
          <div>
            Quaternion:
            [${point.geometry.quaternion
              .toArray()
              .map((v) => v.toFixed(3))
              .join(', ')}]
          </div>
          ${orientationDetailsTemplate(type, point)}
        `
      : ''}
  </div>
`;

const orientationDetailsTemplate = (type: string, point: Point) => {
  if (type === 'Satellite') {
    const sat = point as Satellite;
    return html`
      <div>
        Orientation Mode: ${sat.orientationMode.type}
        ${sat.orientationMode.type === 'dynamic'
          ? html`
              <div style="margin-left: 10px;">
                Primary: ${sat.orientationMode.primaryBodyVector} →
                ${formatTargetVector(
                  sat.orientationMode.primaryTargetVector,
                )}<br />
                Secondary: ${sat.orientationMode.secondaryBodyVector} →
                ${formatTargetVector(sat.orientationMode.secondaryTargetVector)}
              </div>
            `
          : html`
              <div style="margin-left: 10px;">
                Fixed quaternion:
                [${sat.orientationMode.ecef_quaternion
                  .map((v: number) => v.toFixed(3))
                  .join(', ')}]
              </div>
            `}
      </div>
      ${cameraDetailsTemplate(point as OrientedPoint)}
    `;
  }
  return cameraDetailsTemplate(point as OrientedPoint);
};

const cameraDetailsTemplate = (point: OrientedPoint) => html`
  <div>
    Camera: ${point.camera ? 'Present' : 'None'}
    ${point.camera
      ? html`
          <div style="margin-left: 10px;">
            Body Orientation:
            [${point.camera_orientation?.map((v) => v.toFixed(3))?.join(', ') ??
            'default'}]
          </div>
        `
      : ''}
  </div>
`;

export const plotTemplate = (plotId: string, title: string) => html`
  <div class="plot-header">
    <div class="plot-id">ID: ${plotId}</div>
    <button class="plot-download-button">Download Data</button>
  </div>
  <canvas width="800" height="400"></canvas>
`;
