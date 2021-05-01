import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import { formatDate, formatNumber } from 'utils';
import './LineChart.scss';

function LineChart({
  datasets,
  distribution,
  onDistributionChanged,
  isLoading,
  invertYAxis,
  labelPrefix,
  yAxisPrefix
}) {
  const hasEnoughData = datasets.filter(d => d.data.length > 1).length > 0;

  const chartObjectRef = useRef(null);
  const chartRef = useRef(null);

  function setupChart() {
    if (!hasEnoughData) {
      return;
    }

    if (chartObjectRef.current) {
      chartObjectRef.current.destroy();
    }

    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');

      chartObjectRef.current = new Chart(
        ctx,
        getConfig(datasets, invertYAxis, yAxisPrefix, labelPrefix)
      );
    }
  }

  useEffect(setupChart, [datasets]);

  if (isLoading) {
    return (
      <div className="chart__container">
        <span className="message">Loading...</span>
      </div>
    );
  }

  if (!hasEnoughData) {
    return (
      <div className="chart__container">
        <span className="message">Not enough data to display</span>
      </div>
    );
  }

  return (
    <div className="chart__container">
      {renderDistributionLabel(distribution, onDistributionChanged)}
      <canvas id="line-chart" ref={chartRef} />
    </div>
  );
}

function getConfig(datasets, invertYAxis, yAxisPrefix, labelPrefix) {
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
        },
        onHover: e => {
          e.target.style.cursor = 'pointer';
        },
        onLeave: e => {
          e.target.style.cursor = 'default';
        }
      },
      hover: {
        mode: 'point'
      },
      tooltips: {
        callbacks: {
          title: data => formatDate(data[0].xLabel, 'DD MMM, HH:mm'),
          label: ({ datasetIndex, yLabel }, data) =>
            `${data.datasets[datasetIndex].label}: ${labelPrefix}${formatNumber(yLabel)}`,
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
              callback: value => {
                if (value === 0 && yAxisPrefix === '+') return value;
                return `${yAxisPrefix}${formatNumber(value, true)}`;
              },
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

function renderDistributionLabel(distribution, callback) {
  if (!distribution || distribution.before <= 30) {
    return null;
  }

  const { enabled, after, before } = distribution;

  if (enabled) {
    return (
      <span className="distribution-label">
        {`Showing only ${after} out of ${before} snapshots for easier viewing.`}
        <button type="button" onClick={callback}>
          Show all
        </button>
      </span>
    );
  }

  return (
    <span className="distribution-label">
      {`Showing ${before} snapshots. Are these hard to read?`}
      <button type="button" onClick={callback}>
        Click to smoothen the chart
      </button>
    </span>
  );
}

LineChart.defaultProps = {
  invertYAxis: false,
  isLoading: false,
  labelPrefix: '',
  yAxisPrefix: '',
  distribution: undefined,
  onDistributionChanged: undefined
};

LineChart.propTypes = {
  // The datasets to display, each set will be a line in the graph
  datasets: PropTypes.arrayOf(PropTypes.shape()).isRequired,

  distribution: PropTypes.shape(PropTypes.shape()),

  labelPrefix: PropTypes.string,
  yAxisPrefix: PropTypes.string,

  onDistributionChanged: PropTypes.func,

  isLoading: PropTypes.bool,

  // If true, the Y axis will be inverted (Useful for displaying rank progress)
  invertYAxis: PropTypes.bool
};

export default React.memo(LineChart);
