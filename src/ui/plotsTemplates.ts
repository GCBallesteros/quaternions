import { html, TemplateResult } from 'lit-html';

import { commonStyles } from './styles/common.js';
import { plotStyles } from './styles/plots.js';

export const plotListTemplate = (): TemplateResult<1> => html`
  <div class=${commonStyles.sectionContainer}>
    <h3 class=${commonStyles.sectionTitle}>Plots</h3>
    <div id="plots-list"></div>
  </div>
`;

export const plotTemplate = (
  plotId: string,
  onDownload: () => void,
): TemplateResult<1> => html`
  <div class=${plotStyles.container}>
    <div>
      <div class=${plotStyles.header.wrapper}>
        <h3 class=${plotStyles.header.id}>id: ${plotId}</h3>
        <button class=${plotStyles.header.button} @click=${onDownload}>
          Download Data
        </button>
      </div>
      <div>
        <canvas class=${plotStyles.canvas} width="800" height="400"></canvas>
      </div>
    </div>
  </div>
`;
