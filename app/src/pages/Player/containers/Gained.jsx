/* eslint-disable react/destructuring-assignment */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getMeasure } from 'utils';
import { SKILLS, BOSSES, ACTIVITIES } from 'config';
import { LineChart } from 'components';
import { snapshotSelectors } from 'redux/snapshots';
import { deltasSelectors } from 'redux/deltas';
import { PlayerDeltasInfo, PlayerDeltasTable } from '../components';
import { PlayerContext } from '../context';

function Gained({ onTimerEnded }) {
  const { context, updateContext } = useContext(PlayerContext);
  const { username, period, metricType } = context;

  const metric = getSelectedMetric(context.metric, metricType);
  const [isReducedChart, setReducedChart] = useState(true);

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
