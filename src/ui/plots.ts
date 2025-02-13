import { State, Plot } from '../types.js';

const workers = new Map<string, Worker>();
const canvases = new Map<string, HTMLCanvasElement>();

function createPlotElement(
  plotId: string,
  plot: Plot,
  state: State,
): HTMLElement {
  const plotElement = document.createElement('div');
  plotElement.className = 'plot-item';

  // Make download button
  const downloadButton = document.createElement('button');
  downloadButton.className = 'plot-download-button';
  downloadButton.textContent = 'Download Data';
  downloadButton.onclick = () => {
    const plot = state.plots[plotId];
    if (!plot) return;

    // Create CSV content
    const headers = ['Timestamp', ...plot.lines];
    const rows = [headers];

    // Add data rows
    for (let i = 0; i < plot.data.currentIndex; i++) {
      // Ensure we use UTC time consistently
      const date = new Date(plot.data.timestamps[i]);
      const timestamp = date.toISOString();
      const values = plot.lines.map((line) =>
        plot.data.values[line][i].toString(),
      );
      rows.push([timestamp, ...values]);
    }

    const csvContent = rows.map((row) => row.join(',')).join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plot.title.replace(/\s+/g, '_')}_${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const canvas = document.createElement('canvas');
  canvas.width = 800; // Set fixed size for OffscreenCanvas
  canvas.height = 400;
  plotElement.appendChild(canvas);
  plotElement.appendChild(downloadButton);
  canvases.set(plotId, canvas);

  // Create worker and transfer canvas control
  const worker = new Worker(
    new URL('../workers/chartWorker.ts', import.meta.url),
    { type: 'module' },
  );
  workers.set(plotId, worker);

  // Transfer canvas control to worker
  const offscreen = canvas.transferControlToOffscreen();
  worker.postMessage(
    {
      type: 'INIT',
      plotId,
      canvas: offscreen,
      config: {
        title: plot.title,
        lines: plot.lines,
      },
    },
    [offscreen],
  );

  return plotElement;
}

function getLineColor(index: number): string {
  const colors = [
    '#ff6384',
    '#36a2eb',
    '#cc65fe',
    '#ffce56',
    '#4bc0c0',
    '#ff9f40',
    '#9966ff',
    '#c9cbcf',
  ];
  return colors[index % colors.length];
}

function updatePlots(state: State): void {
  // Early return if time is not flowing since there's no new data to display
  if (!state.isTimeFlowing) return;

  const plotsList = document.getElementById('plots-list')!;
  const currentPlots = new Set(Object.keys(state.plots));

  // Remove charts for plots that no longer exist
  Array.from(plotsList.children).forEach((element) => {
    const plotId = element.getAttribute('data-plot-id');
    if (plotId && !currentPlots.has(plotId)) {
      const worker = workers.get(plotId);
      if (worker) {
        worker.postMessage({ type: 'DESTROY', plotId });
        worker.terminate();
        workers.delete(plotId);
      }
      element.remove();
    }
  });

  // Update or create elements for current plots
  Object.entries(state.plots).forEach(([plotId, plot]) => {
    let plotElement = Array.from(plotsList.children).find(
      (el) => el.getAttribute('data-plot-id') === plotId,
    ) as HTMLElement;

    if (!plotElement) {
      plotElement = createPlotElement(plotId, plot, state);
      plotElement.setAttribute('data-plot-id', plotId);
      plotsList.appendChild(plotElement);
    }

    // Update worker with all new data points since last update
    const worker = workers.get(plotId);
    if (worker) {
      const plot = state.plots[plotId];
      const lastSentIndex = plot.lastSentIndex || 0;
      const currentIndex = plot.data.currentIndex;

      if (currentIndex > lastSentIndex) {
        // Send all new points
        const newData = {
          timestamps: plot.data.timestamps.slice(lastSentIndex, currentIndex),
          values: {} as Record<string, number[]>,
        };

        // For each line, get all new values
        plot.lines.forEach((line) => {
          newData.values[line] = plot.data.values[line].slice(
            lastSentIndex,
            currentIndex,
          );
        });

        worker.postMessage({
          type: 'UPDATE',
          plotId,
          config: {
            lines: plot.lines,
          },
          data: newData,
        });

        // Update the last sent index
        plot.lastSentIndex = currentIndex;
      }
    }
  });
}

export function setupPlotsTab(state: State): void {
  const plotsContainer = document.getElementById('plots-container')!;

  plotsContainer.innerHTML = `
    <div class="settings-group">
      <h3>Plots</h3>
      <div id="plots-list"></div>
    </div>
  `;

  // Setup periodic updates
  setInterval(() => updatePlots(state), 1000);
}
