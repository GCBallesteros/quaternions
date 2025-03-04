import { html, TemplateResult } from 'lit-html';

import { OrientedPoint } from '../points/orientedPoint.js';
import { Point } from '../points/point.js';
import { NamedTargets, Satellite } from '../points/satellite.js';
import { Array3, State } from '../types.js';

import { bodyStyles } from './styles/bodies.js';
import { commonStyles } from './styles/common.js';

function formatTargetVector(target: Array3 | NamedTargets): string {
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
}): TemplateResult<1> => html`
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

const trailToggleTemplate = (satellite: Satellite): TemplateResult<1> => html`
  <div class=${commonStyles.toggle.container}>
    <label class=${commonStyles.toggle.label}>
      <input
        type="checkbox"
        class=${commonStyles.toggle.input}
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
      <div class=${commonStyles.toggle.slider}></div>
    </label>
    <span class="text-lg text-blue-500">📷</span>
  </div>
`;

const satelliteOrientationTemplate = (
  satellite: Satellite,
): TemplateResult<1> => html`
  <div>
    Orientation Mode: ${satellite.orientationMode.type}
    ${satellite.orientationMode.type === 'dynamic'
      ? html`
          <div style="margin-left: 10px;">
            Primary: ${satellite.orientationMode.primaryBodyVector} →
            ${formatTargetVector(
              satellite.orientationMode.primaryTargetVector as any,
            )}<br />
            Secondary: ${(satellite.orientationMode as any).secondaryBodyVector}
            →
            ${formatTargetVector(
              satellite.orientationMode.secondaryTargetVector as any,
            )}
          </div>
        `
      : html`
          <div style="margin-left: 10px;">
            Fixed quaternion:
            [${satellite.orientationMode.ecef_quaternion
              .map((v) => v.toFixed(3))
              .join(', ')}]
          </div>
        `}
  </div>
`;

const cameraDetailsTemplate = (point: OrientedPoint): TemplateResult<1> => {
  // Only check camera once
  const hasCamera = point.camera !== null;
  return html`
    <div>
      Camera: ${hasCamera ? 'Present' : 'None'}
      ${hasCamera
        ? html`
            <div style="margin-left: 10px;">
              Body Orientation:
              [${point.camera_orientation
                ?.map((v) => v.toFixed(3))
                ?.join(', ') ?? 'default'}]
            </div>
          `
        : ''}
    </div>
  `;
};

const pointDetailsTemplate = (
  type: string,
  point: Point,
): TemplateResult<1> => html`
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
              ${point instanceof OrientedPoint && point.hasCamera
                ? cameraDetailsTemplate(point)
                : ''}
            `
          : point instanceof OrientedPoint && point.hasCamera
            ? cameraDetailsTemplate(point)
            : ''}
      `
    : ''}
`;

export const pointItemTemplate = (
  name: string,
  type: string,
  point: Point,
  isExpanded: boolean,
): TemplateResult<1> => html`
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
        ${type === 'Satellite' && point instanceof Satellite
          ? html`
              ${point.camera
                ? trailToggleTemplate(point)
                : html`<span class="text-sm text-neutral-400"
                    >(no camera)</span
                  >`}
            `
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
): TemplateResult<1> => html`
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
