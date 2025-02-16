import { html } from 'lit-html';

export const plotTemplate = (plotId: string, onDownload: () => void) => html`
  <div class="plot-header">
    <div class="plot-id">ID: ${plotId}</div>
    <button class="plot-download-button" @click=${onDownload}>
      Download Data
    </button>
  </div>
  <canvas width="800" height="400"></canvas>
`;
