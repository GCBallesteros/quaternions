import { Chart } from 'chart.js/auto';
import { State, Plot } from '../types.js';

const charts = new Map<string, Chart>();

function createPlotElement(plotId: string, plot: Plot): HTMLElement {
  const plotElement = document.createElement('div');
  plotElement.className = 'plot-item';

  const canvas = document.createElement('canvas');
  plotElement.appendChild(canvas);

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: [],
      datasets: plot.lines.map((line, i) => ({
        label: line,
        data: [],
        borderColor: getLineColor(i),
        tension: 0.4,
      })),
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        title: {
          display: true,
          text: plot.title,
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'second',
          },
        },
      },
    },
  });

  charts.set(plotId, chart);
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
      const chart = charts.get(plotId);
      if (chart) {
        chart.destroy();
        charts.delete(plotId);
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

    // Update chart data
    const chart = charts.get(plotId);
    if (chart) {
      chart.data.labels = plot.data.map((d) => d.timestamp);
      plot.lines.forEach((_, i) => {
        chart.data.datasets[i].data = plot.data.map((d) => d.values[i]);
      });
      // AI! I get Uncaught Error: This method is not implemented: Check that a complete date adapter is provided.
      // Starting from this line on the dev tool
      chart.update('none'); // Update without animation
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
  setInterval(() => updatePlots(state), 100);
}
