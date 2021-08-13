/* eslint-disable react/destructuring-assignment */
import React, { useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { some } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { getMeasure, formatDate, getDeltasChartData } from 'utils';
import { SKILLS, BOSSES, ACTIVITIES } from 'config';
import { LineChart, Selector, TablePlaceholder } from 'components';
import { snapshotSelectors, snapshotActions } from 'redux/snapshots';
import { deltasSelectors, deltasActions } from 'redux/deltas';
import CustomPeriodSelectionModal from 'modals/CustomPeriodSelectionModal';
import { PlayerDeltasInfo, PlayerDeltasTable } from '../components';
import { PlayerContext } from '../context';

const DEFAULT_PERIOD = 'week';

const PERIOD_OPTIONS = [
  { label: '5 Min', value: '5min' },
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'Custom Period', value: 'custom' }
];

const METRIC_TYPE_OPTIONS = [
  { label: 'Skilling', value: 'skilling' },
  { label: 'Bossing', value: 'bossing' },
  { label: 'Activities', value: 'activities' }
];

function Gained() {
  const dispatch = useDispatch();
  const { context, updateContext } = useContext(PlayerContext);
  const { username, period, metricType, startDate, endDate } = context;

  const [isReducedChart, setReducedChart] = useState(true);

  const metric = getSelectedMetric(context.metric, metricType);
  const measure = getMeasure(metric);
  const periodIndex = PERIOD_OPTIONS.findIndex(o => o.value === period);
  const metricTypeIndex = METRIC_TYPE_OPTIONS.findIndex(o => o.value === metricType);

  const isLoadingDeltas = useSelector(deltasSelectors.isFetchingPlayerDeltas);
  const isLoadingSnapshots = useSelector(snapshotSelectors.isFetchingPlayerSnapshots);

  const deltas = useSelector(deltasSelectors.getPlayerDeltas(username));
  const snapshots = useSelector(snapshotSelectors.getPlayerSnapshots(username));

  const periodSnapshots = snapshots && snapshots[period];
  const showCustomPeriodInfo = period === 'custom' && startDate && endDate;
  const showInvalidRanksWarning = deltas && hasInvalidRanks(deltas[period]);
  const showPeriodSelectionModal = period === 'custom' && (!startDate || !endDate);

  const rankChartData = getDeltasChartData(periodSnapshots, metric, 'rank', isReducedChart);
  const experienceChartData = getDeltasChartData(periodSnapshots, metric, measure, isReducedChart);

  const showDeltasTable = deltas && period && deltas[period];

  const handleMetricTypeSelected = e => {
    if (e.value === 'skilling') {
      updateContext({ metricType: e.value, metric: SKILLS[0] });
    } else if (e.value === 'bossing') {
      updateContext({ metricType: e.value, metric: BOSSES[0] });
    } else if (e.value === 'activities') {
      updateContext({ metricType: e.value, metric: ACTIVITIES[0] });
    }
  };

  const handleCustomPeriodSelected = dates => {
    // Clear any currently loaded "custom period" snapshots
    dispatch(snapshotActions.invalidateSnapshots(username, period));
    // Clear any currently loaded "custom period" deltas
    dispatch(deltasActions.invalidateDeltas(username, period));

    updateContext({ startDate: dates.startDate, endDate: dates.endDate });
  };

  const fetchSnapshots = useCallback(() => {
    if (snapshots && snapshots[period]) return;

    if (period !== 'custom') {
      dispatch(snapshotActions.fetchSnapshots(username, period));
    } else if (startDate && endDate) {
      dispatch(snapshotActions.fetchSnapshots(username, null, startDate, endDate));
    }
  }, [dispatch, username, period, startDate, endDate, snapshots]);

  const fetchDeltas = useCallback(() => {
    if (deltas && deltas[period]) return;

    if (period !== 'custom') {
      dispatch(deltasActions.fetchPlayerDeltas(username));
    } else if (startDate && endDate) {
      dispatch(deltasActions.fetchPlayerDeltas(username, startDate, endDate));
    }
  }, [dispatch, username, period, startDate, endDate, deltas]);

  useEffect(fetchSnapshots, [fetchSnapshots]);
  useEffect(fetchDeltas, [fetchDeltas]);

  return (
    <>
      <div className="col-lg-6 col-md-12">
        <LineChart
          datasets={experienceChartData.datasets}
          distribution={experienceChartData.distribution}
          onDistributionChanged={() => setReducedChart(val => !val)}
          isLoading={isLoadingSnapshots}
        />
        <LineChart
          datasets={rankChartData.datasets}
          distribution={experienceChartData.distribution}
          onDistributionChanged={() => setReducedChart(val => !val)}
          isLoading={isLoadingSnapshots}
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
              onSelect={e => updateContext({ period: e.value, startDate: null, endDate: null })}
            />
          </div>
        </div>
        {showInvalidRanksWarning && <InvalidRanksWarning />}
        {showCustomPeriodInfo && (
          <CustomPeriodInfo
            startDate={startDate}
            endDate={endDate}
            onChangePeriodClicked={() => updateContext({ startDate: null, endDate: null })}
          />
        )}
        {period !== 'custom' && <PlayerDeltasInfo deltas={deltas} period={period} />}
        {isLoadingDeltas ? (
          <TablePlaceholder size={20} />
        ) : (
          showDeltasTable && (
            <PlayerDeltasTable
              deltas={deltas}
              period={period}
              metricType={metricType}
              highlightedMetric={metric}
              onMetricSelected={newMetric => updateContext({ metric: newMetric })}
              isLoading={isLoadingDeltas}
            />
          )
        )}
        {showPeriodSelectionModal && (
          <CustomPeriodSelectionModal
            onConfirm={handleCustomPeriodSelected}
            onCancel={() => updateContext({ period: DEFAULT_PERIOD })}
          />
        )}
      </div>
    </>
  );
}

function CustomPeriodInfo({ startDate, endDate, onChangePeriodClicked }) {
  return (
    <div className="deltas-warning -info">
      <img src="/img/icons/warn_blue.svg" alt="" />
      <span>
        {`Showing player gains from ${formatDate(startDate)} to ${formatDate(endDate)}.`}
        <br />
        <button type="button" onClick={onChangePeriodClicked}>
          Click here to change
        </button>
      </span>
    </div>
  );
}

function InvalidRanksWarning() {
  return (
    <div className="deltas-warning">
      <img src="/img/icons/warn_orange.svg" alt="" />
      <span>
        If your skill ranks wrongfuly show 0 gained, don&apos;t worry, this was caused by a bug and it
        will go away on its own within a few days/weeks.
      </span>
    </div>
  );
}

function hasInvalidRanks(periodDeltas) {
  return (
    periodDeltas &&
    some(periodDeltas, data => {
      return data && data.rank && data.rank.start !== data.rank.end && data.rank.gained === 0;
    })
  );
}

function getSelectedMetric(metric, metricType) {
  if (metric) return metric;
  if (metricType === 'bossing') return BOSSES[0];
  if (metricType === 'activities') return ACTIVITIES[0];
  return SKILLS[0];
}

CustomPeriodInfo.propTypes = {
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
  onChangePeriodClicked: PropTypes.func.isRequired
};

export default Gained;
