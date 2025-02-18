import { html } from 'lit-html';
import { bodyStyles } from './styles/bodies.js';
import { commonStyles } from './styles/common.js';
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
  <div class=${commonStyles.sectionContainer}>
    <h3 class=${commonStyles.sectionTitle}>Moon</h3>
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
  <div class=${bodyStyles.trailToggle.container}>
    <label class=${bodyStyles.trailToggle.toggle.label}>
      <input
        type="checkbox"
        class=${bodyStyles.trailToggle.toggle.input}
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
      <div class=${bodyStyles.trailToggle.toggle.slider}></div>
    </label>
    <span class=${bodyStyles.trailToggle.toggle.icon}>📷</span>
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
  <div class=${bodyStyles.pointItem.container}>
    <details ?open=${isExpanded} class="group">
      <summary class=${bodyStyles.pointItem.summary.wrapper}>
        <input
          type="color"
          class=${bodyStyles.pointItem.summary.colorPicker}
          .value=${point.color}
          title="Point color"
          @input=${(e: Event) => {
            point.color = (e.target as HTMLInputElement).value;
          }}
        />
        <span>${name}</span>
        ${type === 'Satellite' && (point as OrientedPoint).camera
          ? trailToggleTemplate(point as Satellite)
          : ''}
        <span class=${bodyStyles.pointItem.summary.type}>${type}</span>
      </summary>
      <div class=${bodyStyles.pointItem.details}>
        ${pointDetailsTemplate(type, point)}
      </div>
    </details>
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
  <div class=${commonStyles.sectionContainer}>
    <h3 class=${commonStyles.sectionTitle}>Points</h3>
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
