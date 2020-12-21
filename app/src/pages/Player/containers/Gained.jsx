/* eslint-disable react/destructuring-assignment */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getMeasure } from 'utils';
import { SKILLS, BOSSES, ACTIVITIES } from 'config';
import { LineChart, Selector } from 'components';
import { snapshotSelectors } from 'redux/snapshots';
import { deltasSelectors } from 'redux/deltas';
import { PlayerDeltasInfo, PlayerDeltasTable } from '../components';
import { PlayerContext } from '../context';

const PERIOD_OPTIONS = [
  { label: '6 Hours', value: '6h' },
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' }
];

const METRIC_TYPE_OPTIONS = [
  { label: 'Skilling', value: 'skilling' },
  { label: 'Bossing', value: 'bossing' },
  { label: 'Activities', value: 'activities' }
];

function Gained({ onTimerEnded }) {
  const { context, updateContext } = useContext(PlayerContext);
  const { username, period, metricType } = context;

  const [isReducedChart, setReducedChart] = useState(true);

  const metric = getSelectedMetric(context.metric, metricType);

  const metricTypeIndex = METRIC_TYPE_OPTIONS.findIndex(o => o.value === metricType);
  const periodIndex = PERIOD_OPTIONS.findIndex(o => o.value === period);

  const deltas = useSelector(state => deltasSelectors.getPlayerDeltas(state, username));

  const experienceChartData = useSelector(state =>
    snapshotSelectors.getChartData(state, username, period, metric, getMeasure(metric), isReducedChart)
  );

  const rankChartData = useSelector(state =>
    snapshotSelectors.getChartData(state, username, period, metric, 'rank', isReducedChart)
  );

  function handleMetricSelected(newMetric) {
    updateContext({ metric: newMetric });
  }

  function handleMetricTypeSelected(e) {
    if (e.value === 'skilling') {
      updateContext({ metricType: e.value, metric: SKILLS[0] });
    } else if (e.value === 'bossing') {
      updateContext({ metricType: e.value, metric: BOSSES[0] });
    } else if (e.value === 'activities') {
      updateContext({ metricType: e.value, metric: ACTIVITIES[0] });
    }
  }

  function handlePeriodSelected(e) {
    updateContext({ period: e.value });
  }

  return (
    <>
      <div className="col-lg-6 col-md-12">
        <LineChart
          datasets={experienceChartData.datasets}
          distribution={experienceChartData.distribution}
          onDistributionChanged={() => setReducedChart(val => !val)}
        />
        <LineChart
          datasets={rankChartData.datasets}
          distribution={experienceChartData.distribution}
          onDistributionChanged={() => setReducedChart(val => !val)}
          invertYAxis
        />
      </div>
      <div className="col-lg-6 col-md-12">
        <div className="row gained-controls">
          <div className="col-lg-6 col-md-6 col-sm-12">
            <Selector
              options={METRIC_TYPE_OPTIONS}
              selectedIndex={metricTypeIndex}
              onSelect={handleMetricTypeSelected}
            />
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12">
            <Selector
              options={PERIOD_OPTIONS}
              selectedIndex={periodIndex}
              onSelect={handlePeriodSelected}
            />
          </div>
        </div>
        <PlayerDeltasInfo deltas={deltas} period={period} onTimerEnded={onTimerEnded} />
        {deltas && period && deltas[period] && (
          <PlayerDeltasTable
            deltas={deltas}
            period={period}
            metricType={metricType}
            highlightedMetric={metric}
            onMetricSelected={handleMetricSelected}
          />
        )}
      </div>
    </>
  );
}

function getSelectedMetric(metric, metricType) {
  if (metric) return metric;
  if (metricType === 'bossing') return BOSSES[0];
  if (metricType === 'activities') return ACTIVITIES[0];
  return SKILLS[0];
}

Gained.propTypes = {
  onTimerEnded: PropTypes.func.isRequired
};

export default Gained;
