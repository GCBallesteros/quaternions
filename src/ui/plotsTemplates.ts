import { html } from 'lit-html';

import { plotStyles } from './styles/plots.js';

export const plotTemplate = (plotId: string, onDownload: () => void) => html`
  <div class=${plotStyles.container}>
    <div class=${plotStyles.header.wrapper}>
      <div class=${plotStyles.header.id}>ID: ${plotId}</div>
      <button class=${plotStyles.header.button} @click=${onDownload}>
        Download Data
      </button>
    </div>
    <canvas class=${plotStyles.canvas} width="800" height="400"></canvas>
  </div>
`;
