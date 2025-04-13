// [file name]: charts.js
class FocusCharts {
  constructor(storage) {
    this.storage = storage;
    this.chart = new Chart(document.getElementById('trend-chart'), {
      type: 'line',
      data: { datasets: [{
        label: 'Daily Hours',
        borderColor: '#0ea5e9',
        tension: 0.3,
        data: []
      }]},
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        parsing: {
          xAxisKey: 'x',
          yAxisKey: 'y'
        },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  updateTrend(monthLogs) {
    const data = Object.entries(monthLogs).map(([date, log]) => ({
      x: date,
      y: log.hours
    }));
    this.chart.data.datasets[0].data = data;
    this.chart.update();
  }
}