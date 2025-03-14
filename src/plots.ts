import { log } from './logger.js';
import { State } from './types.js';
import { workers, canvases } from './ui/plots.js';

export function updatePlots(state: State, frameCount: number): void {
  Object.entries(state.plots).forEach(([plotId, plot]) => {
    if (frameCount % plot.sampleEvery === 0) {
      try {
        const values = plot.callback();
        if (!Array.isArray(values) || values.length !== plot.lines.length) {
          console.error(
            `Plot "${plotId}": Callback returned invalid data. Expected ${plot.lines.length} values, got ${values?.length}`,
          );
          return;
        }

        const timestamp = state.currentTime.getTime();
        if (plot.data.currentIndex < plot.data.maxPoints) {
          plot.data.timestamps[plot.data.currentIndex] = timestamp;
          values.forEach((value, i) => {
            if (typeof value !== 'number' || !isFinite(value)) {
              console.error(
                `Plot "${plotId}": Invalid value at index ${i}: ${value}`,
              );
              return;
            }
            plot.data.values[plot.lines[i]][plot.data.currentIndex] = value;
          });
          plot.data.currentIndex++;
        }
      } catch (error) {
        log(`Plot "${plotId}" callback failed. Plot will not update further.`);
        cleanupPlot(plotId, state, false);
      }
    }
  });
}

export function cleanupPlot(
  plotId: string,
  state: State,
  removeElement: boolean = false,
): void {
  const worker = workers.get(plotId);
  if (worker) {
    worker.postMessage({ type: 'DESTROY', plotId });
    worker.terminate();
    workers.delete(plotId);
  }
  canvases.delete(plotId);

  if (removeElement) {
    const plotElement = document.querySelector(`[data-plot-id="${plotId}"]`);
    if (plotElement) {
      plotElement.remove();
    }
    delete state.plots[plotId];
  }
}

export function cleanupAllPlots(state: State): void {
  Object.keys(state.plots).forEach((plotId) => {
    cleanupPlot(plotId, state, true);
  });
}
