import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import { formatDate, formatNumber } from '../../utils';
import './LineChart.scss';

function getConfig(datasets, invertYAxis) {
  return {
    type: 'line',
    data: {
      labels: [],
      datasets
    },
    options: {
      animation: false,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          fontColor: 'white',
          padding: 30
        }
      },
      tooltips: {
        callbacks: {
          title: data => formatDate(data[0].xLabel, 'DD MMM, HH:mm'),
          label: ({ datasetIndex, yLabel }, data) =>
            `${data.datasets[datasetIndex].label}: ${formatNumber(yLabel)}`,
          labelColor: (tooltipItem, c) => ({
            backgroundColor: c.config.data.datasets[tooltipItem.datasetIndex].borderColor
          })
        }
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            distribution: 'linear',
            time: {
              displayFormats: {
                hour: 'D MMM, HH:mm'
              }
            },
            ticks: {
              maxTicksLimit: 5,
              maxRotation: 0,
              minRotation: 0
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              reverse: invertYAxis,
              callback: value => `${value / 1000}k`,
              beginAtZero: false,
              maxTicksLimit: 5
            }
          }
        ]
      },
      elements: {
        line: {
          tension: 0
        }
      }
    }
  };
}

function LineChart({ datasets, invertYAxis }) {
  const chartObjectRef = useRef(null);
  const chartRef = useRef(null);

  function setupChart() {
    if (chartObjectRef.current) {
      chartObjectRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    // eslint-disable-next-line
    chartObjectRef.current = new Chart(ctx, getConfig(datasets, invertYAxis));
  }

  useEffect(setupChart, [datasets]);

  return (
    <div className="chart__container">
      <canvas id="line-chart" ref={chartRef} />
    </div>
  );
}

LineChart.defaultProps = {
  invertYAxis: false
};

LineChart.propTypes = {
  // The datasets to display, each set will be a line in the graph
  datasets: PropTypes.arrayOf(PropTypes.shape()).isRequired,

  // If true, the Y axis will be inverted (Useful for displaying rank progress)
  invertYAxis: PropTypes.bool
};

export default React.memo(LineChart);
