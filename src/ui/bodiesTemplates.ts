import { html } from 'lit-html';
import { Point } from '../points/point.js';
import { OrientedPoint } from '../points/orientedPoint.js';
import { Satellite } from '../points/satellite.js';
import { State } from '../types.js';

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
        ? html`
            <div class="trail-toggle">
              <label class="switch">
                <input
                  type="checkbox"
                  class="trail-switch"
                  ?checked=${(point as Satellite).hasTrail}
                  @change=${(e: Event) => {
                    const satellite = point as Satellite;
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
          `
        : ''}
      <span class="point-type">${type}</span>
    </div>
    <div class="point-details ${isExpanded ? 'expanded' : ''}">
      <div>
        Position: [${point.position.map((v) => v.toFixed(2)).join(', ')}]
      </div>
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
                  <div>
                    Orientation Mode:
                    ${(point as Satellite).orientationMode.type}
                    ${(point as Satellite).orientationMode.type === 'dynamic'
                      ? html`
                          <div style="margin-left: 10px;">
                            Primary:
                            ${((point as Satellite).orientationMode as any)
                              .primaryBodyVector}
                            →
                            ${JSON.stringify(
                              ((point as Satellite).orientationMode as any)
                                .primaryTargetVector,
                            )}<br />
                            Secondary:
                            ${((point as Satellite).orientationMode as any)
                              .secondaryBodyVector}
                            →
                            ${JSON.stringify(
                              ((point as Satellite).orientationMode as any)
                                .secondaryTargetVector,
                            )}
                          </div>
                        `
                      : html`
                          <div style="margin-left: 10px;">
                            Fixed quaternion:
                            [${(
                              (point as Satellite).orientationMode as any
                            ).ecef_quaternion
                              .map((v) => v.toFixed(3))
                              .join(', ')}]
                          </div>
                        `}
                  </div>
                `
              : ''}
          `
        : ''}
    </div>
  </div>
`;
