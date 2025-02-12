import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

let charts = new Map<
  string,
  {
    chart: Chart;
    canvas: OffscreenCanvas;
    data: {
      timestamps: number[];
      values: Record<string, number[]>;
    };
  }
>();

self.onmessage = async (e: MessageEvent) => {
  const { type, plotId, config, data } = e.data;

  switch (type) {
    case 'INIT': {
      const canvas = e.data.canvas as OffscreenCanvas;
      const chart = new Chart(canvas as unknown as HTMLCanvasElement, {
        type: 'line',
        data: {
          labels: [],
          datasets: config.lines.map((line: string, i: number) => ({
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
              text: config.title,
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

      charts.set(plotId, {
        chart,
        canvas,
        data: {
          timestamps: [],
          values: Object.fromEntries(config.lines.map((line) => [line, []])),
        },
      });
      break;
    }

    case 'UPDATE': {
      const chartData = charts.get(plotId);
      if (chartData) {
        const { chart, data: storedData } = chartData;

        // Append new data points
        storedData.timestamps.push(...data.timestamps);
        config.lines.forEach((line: string) => {
          storedData.values[line].push(...data.values[line]);
        });

        // Update chart with all stored data
        chart.data.labels = storedData.timestamps;
        config.lines.forEach((line: string, i: number) => {
          chart.data.datasets[i].data = storedData.values[line];
        });

        chart.update('none');
      }
      break;
    }

    case 'DESTROY': {
      const chartData = charts.get(plotId);
      if (chartData) {
        chartData.chart.destroy();
        charts.delete(plotId);
      }
      break;
    }
  }
};

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
