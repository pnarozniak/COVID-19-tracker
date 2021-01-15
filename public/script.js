const countrySelect = document.getElementById('country-select');
countrySelect.addEventListener('change', (e) => {
  const value = e.target.value;
  const target = value === 'Global' ? '' : `/countries/${value}`;
  window.location = `${window.location.protocol}//${window.location.host}${target}`;
});

google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

let chartData;

const chartLoader = {
  loader: document.getElementById('chart-loader'),
  error: document.getElementById('chart-error'),
  show() {
    this.error.classList.remove('chart-error-show');
    this.loader.classList.add('chart-loader-show');
  },
  hide(err) {
    this.loader.classList.remove('chart-loader-show');
    if (err) {
      this.error.classList.add('chart-error-show');
      this.error.innerHTML = err;
    }
  },
};

async function drawChart() {
  if (currCountry === 'Global') {
    chartLoader.hide(`Chart statiscits are available<br>only for countries!`);
    return;
  }

  if (!chartData) {
    chartLoader.show();
    chartData = await fetchChartData();
    if (!chartData) {
      chartLoader.hide(`An unexpected error occurred<br>please try again!`);
      return;
    }
    chartLoader.hide();
  }

  const legendContainer = document.getElementById('chart-legend-container');
  legendContainer.style.display = 'flex';

  const chartOptions = {
    title: `${currCountry} COVID-19 statistics`,
    titleTextStyle: {
      fontSize: 18,
      fontName: 'Roboto',
      color: '#8e44ad',
    },
    legend: { position: 'none' },
    chartArea: {
      width: '80%',
      vAxis: { minValue: 0 },
    },
    colors: ['#2c3e50', '#2ecc71', 'indianred'],
    pointSize: 5,
  };

  const data = google.visualization.arrayToDataTable(chartData);
  const chart = new google.visualization.LineChart(
    document.getElementById('chart')
  );
  chart.draw(data, chartOptions);

  const checkBoxes = Array.from(
    document.querySelectorAll(
      '#deaths-checkbox',
      '#confirmed-checkbox',
      '#recovered-checkbox'
    )
  );
  const hiddenSeries = [];
  checkBoxes.forEach((checkbox) => {
    addEventListener('change', ({ target }) => {
      const { checked, value } = target;

      if (!checked && hiddenSeries.length === 2) {
        target.checked = true;
      } else {
        toggleSeries(checked, parseInt(value));
      }
    });
  });

  window.onresize = () => {
    drawReducedChart();
  };

  const toggleSeries = (checked, value) => {
    if (!checked) {
      hiddenSeries.push(value);
    } else {
      const index = hiddenSeries.findIndex((i) => i == value);
      hiddenSeries.splice(index, 1);
    }
    drawReducedChart();
  };

  const drawReducedChart = () => {
    const view = new google.visualization.DataView(data);
    view.hideColumns(hiddenSeries);

    const colors = ['#2c3e50', '#2ecc71', 'indianred'].filter(
      (color, colorIndex) => {
        return !hiddenSeries.some((e) => e == colorIndex + 1);
      }
    );
    chartOptions.colors = colors;

    chart.draw(view, chartOptions);
  };
}

const fetchChartData = async () => {
  const url = `/chart-data/countries/${currCountry}`;
  try {
    const response = await fetch(url);
    if (response.status === 200) {
      const { chartData } = await response.json();
      return chartData;
    }
  } catch (err) {
    console.log('err');
  }
};
