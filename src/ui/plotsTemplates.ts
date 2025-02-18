import { html } from 'lit-html';
import { plotStyles } from './styles/plots.js';
import { commonStyles } from './styles/common.js';

export const plotListTemplate = () => html`
  <div class=${commonStyles.sectionContainer}>
    <h3 class=${commonStyles.sectionTitle}>Plots</h3>
    <div id="plots-list"></div>
  </div>
`;

export const plotTemplate = (plotId: string, onDownload: () => void) => html`
  <div class=${plotStyles.container}>
    <div class=${plotStyles.header.wrapper}>
      <h3 class=${commonStyles.sectionTitle}>Plot ${plotId}</h3>
      <button class=${plotStyles.header.button} @click=${onDownload}>
        Download Data
      </button>
    </div>
    <canvas class=${plotStyles.canvas} width="800" height="400"></canvas>
  </div>
`;
