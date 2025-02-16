import { html } from 'lit-html';
import { Point } from '../points/point.js';
import { OrientedPoint } from '../points/orientedPoint.js';
import { Satellite } from '../points/satellite.js';
import { State, Vector3 } from '../types.js';
import { NamedTargets } from '../points/satellite.js';

function formatTargetVector(target: Vector3 | NamedTargets): string {
  if (typeof target === 'object' && target !== null && 'type' in target) {
    if (target.type === 'TargetPointing') {
      return `TargetPointing(${JSON.stringify(target.target)})`;
    }
    return target.type;
  }
  return JSON.stringify(target);
}

export const moonTemplate = (moonPos: {
  x: number;
  y: number;
  z: number;
  angle: number;
}) => html`
  <div class="settings-group">
    <h3>Moon</h3>
    <div class="coordinate-display">
      <div>
        ECEF: <span>${moonPos.x}</span>, <span>${moonPos.y}</span>,
        <span>${moonPos.z}</span> km
      </div>
      <div>Phase angle: <span>${moonPos.angle}</span>°</div>
    </div>
  </div>
`;

const trailToggleTemplate = (satellite: Satellite) => html`
  <div class="trail-toggle">
    <label class="switch">
      <input
        type="checkbox"
        class="trail-switch"
        ?checked=${satellite.hasTrail}
        @change=${(e: Event) => {
          const checked = (e.target as HTMLInputElement).checked;
          if (checked) {
            satellite.enableTrail();
          } else {
            satellite.disableTrail();
          }
        }}
      />
      <span class="slider"></span>
    </label>
    <span class="camera-icon active">📷</span>
  </div>
`;

const satelliteOrientationTemplate = (satellite: Satellite) => html`
  <div>
    Orientation Mode: ${satellite.orientationMode.type}
    ${satellite.orientationMode.type === 'dynamic'
      ? html`
          <div style="margin-left: 10px;">
            Primary: ${(satellite.orientationMode as any).primaryBodyVector} →
            ${formatTargetVector(
              (satellite.orientationMode as any).primaryTargetVector,
            )}<br />
            Secondary: ${(satellite.orientationMode as any).secondaryBodyVector}
            →
            ${formatTargetVector(
              (satellite.orientationMode as any).secondaryTargetVector,
            )}
          </div>
        `
      : html`
          <div style="margin-left: 10px;">
            Fixed quaternion:
            [${(satellite.orientationMode as any).ecef_quaternion
              .map((v) => v.toFixed(3))
              .join(', ')}]
          </div>
        `}
  </div>
`;

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

const pointDetailsTemplate = (type: string, point: Point) => html`
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
        ${type === 'Satellite'
          ? html`
              ${satelliteOrientationTemplate(point as Satellite)}
              ${cameraDetailsTemplate(point as OrientedPoint)}
            `
          : cameraDetailsTemplate(point as OrientedPoint)}
      `
    : ''}
`;

export const pointItemTemplate = (
  name: string,
  type: string,
  point: Point,
  isExpanded: boolean,
) => html`
  <div class="point-item">
    <div class="point-header">
      <span
        class="expand-button ${isExpanded ? 'expanded' : ''}"
        @click=${(e: Event) => {
          const target = e.target as HTMLElement;
          const pointItem = target.closest('.point-item');
          const details = pointItem?.querySelector('.point-details');
          target.classList.toggle('expanded');
          details?.classList.toggle('expanded');
        }}
        >▶</span
      >
      <input
        type="color"
        class="color-picker"
        .value=${point.color}
        title="Point color"
        @input=${(e: Event) => {
          point.color = (e.target as HTMLInputElement).value;
        }}
      />
      <span class="point-name">${name}</span>
      ${type === 'Satellite' && (point as OrientedPoint).camera
        ? trailToggleTemplate(point as Satellite)
        : ''}
      <span class="point-type">${type}</span>
    </div>
    <div class="point-details ${isExpanded ? 'expanded' : ''}">
      ${pointDetailsTemplate(type, point)}
    </div>
  </div>
`;

export const bodiesTemplate = (
  state: State,
  expandedPoints: Set<string>,
) => html`
  ${moonTemplate({
    x: Math.round(state.bodies.moon.position.x),
    y: Math.round(state.bodies.moon.position.y),
    z: Math.round(state.bodies.moon.position.z),
    angle: Math.round((state.bodies.moon as any).phase || 0),
  })}
  <div class="settings-group">
    <h3>Points</h3>
    <div id="points-list">
      ${Object.entries(state.points).map(([name, point]) => {
        const type =
          point instanceof Satellite
            ? 'Satellite'
            : point instanceof OrientedPoint
              ? 'OrientedPoint'
              : 'Point';
        return pointItemTemplate(name, type, point, expandedPoints.has(name));
      })}
    </div>
  </div>
`;
