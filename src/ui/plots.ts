import { State, Plot } from '../types.js';

const workers = new Map<string, Worker>();
const canvases = new Map<string, HTMLCanvasElement>();

function createPlotElement(plotId: string, plot: Plot): HTMLElement {
  const plotElement = document.createElement('div');
  plotElement.className = 'plot-item';

  const canvas = document.createElement('canvas');
  canvas.width = 800; // Set fixed size for OffscreenCanvas
  canvas.height = 400;
  plotElement.appendChild(canvas);
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
      plotElement = createPlotElement(plotId, plot);
      plotElement.setAttribute('data-plot-id', plotId);
      plotsList.appendChild(plotElement);
    }

    // Update worker with only new data points
    const worker = workers.get(plotId);
    if (worker) {
      const plot = state.plots[plotId];
      const lastIndex = plot.data.currentIndex;
      const prevIndex = lastIndex - 1;

      if (prevIndex >= 0) {
        // Send just the latest point
        const newData = {
          timestamps: [plot.data.timestamps[prevIndex]],
          values: {} as Record<string, number[]>,
        };

        // For each line, get just the new value
        plot.lines.forEach((line) => {
          newData.values[line] = [plot.data.values[line][prevIndex]];
        });

        worker.postMessage({
          type: 'UPDATE',
          plotId,
          config: {
            lines: plot.lines,
          },
          data: newData,
        });
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
