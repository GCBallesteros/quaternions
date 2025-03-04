import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

type InitMessage = {
  type: 'INIT';
  plotId: string;
  canvas: OffscreenCanvas;
  config: {
    title: string;
    lines: string[];
  };
};

type UpdateMessage = {
  type: 'UPDATE';
  plotId: string;
  config: {
    lines: string[];
  };
  data: {
    timestamps: number[];
    values: Record<string, number[]>;
  };
};

type DestroyMessage = {
  type: 'DESTROY';
  plotId: string;
};

type WorkerMessage = InitMessage | UpdateMessage | DestroyMessage;

const MAX_POINTS = 1000;

const charts = new Map<
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

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const message = e.data;

  switch (message.type) {
    case 'INIT': {
      const chart = new Chart(message.canvas as unknown as HTMLCanvasElement, {
        type: 'line',
        data: {
          labels: [],
          datasets: message.config.lines.map((line: string, i: number) => ({
            label: line,
            data: [],
            borderColor: getLineColor(i),
            tension: 0.4,
            normalized: true,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          animation: false,
          plugins: {
            title: {
              display: true,
              text: message.config.title,
            },
            decimation: {
              enabled: true,
              algorithm: 'lttb', // Largest-Triangle-Three-Buckets
              samples: 200,
            },
          },
          scales: {
            x: {
              type: 'time',
              ticks: {
                maxTicksLimit: 10,
                callback: function (value) {
                  // Ensure we're using UTC time for display
                  const date = new Date(value);
                  const hours = date.getUTCHours().toString().padStart(2, '0');
                  const minutes = date
                    .getUTCMinutes()
                    .toString()
                    .padStart(2, '0');
                  const seconds = date
                    .getUTCSeconds()
                    .toString()
                    .padStart(2, '0');
                  return `${hours}:${minutes}:${seconds}`;
                },
              },
            },
          },
        },
      });

      charts.set(message.plotId, {
        chart,
        canvas: message.canvas,
        data: {
          timestamps: [],
          values: Object.fromEntries(
            message.config.lines.map((line) => [line, []]),
          ),
        },
      });
      break;
    }

    case 'UPDATE': {
      const chartData = charts.get(message.plotId);
      if (chartData) {
        const { chart, data: storedData } = chartData;

        // Add new points
        storedData.timestamps.push(...message.data.timestamps);
        message.config.lines.forEach((line: string) => {
          storedData.values[line].push(...message.data.values[line]);
        });

        // Trim arrays if they exceed MAX_POINTS
        if (storedData.timestamps.length > MAX_POINTS) {
          const excess = storedData.timestamps.length - MAX_POINTS;
          storedData.timestamps = storedData.timestamps.slice(excess);
          message.config.lines.forEach((line: string) => {
            storedData.values[line] = storedData.values[line].slice(excess);
          });
        }

        // Update chart with stored data
        chart.data.labels = storedData.timestamps;
        message.config.lines.forEach((line: string, i: number) => {
          chart.data.datasets[i].data = storedData.values[line];
        });

        chart.update('none');
      }
      break;
    }

    case 'DESTROY': {
      const chartData = charts.get(message.plotId);
      if (chartData) {
        chartData.chart.destroy();
        charts.delete(message.plotId);
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
