import React, { useCallback, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { METRICS, MetricProps, PERIODS, PeriodProps } from '@wise-old-man/utils';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { debounce } from 'lodash';
import { Selector, Table, PlayerTag, NumberLabel, TablePlaceholder } from 'components';
import { durationBetween, getMetricIcon, formatDate } from 'utils';
import { deltasActions, deltasSelectors } from 'redux/deltas';
import { useLazyLoading } from 'hooks';
import CustomPeriodSelectionModal from 'modals/CustomPeriodSelectionModal';
import { GroupContext } from '../context';

const DEFAULT_PERIOD = 'week';

const METRIC_OPTIONS = METRICS.map(metric => ({
  label: MetricProps[metric].name,
  icon: getMetricIcon(metric, true),
  value: metric
}));

const PERIOD_OPTIONS = [
  ...PERIODS.map(period => ({ label: PeriodProps[period].name, value: period })),
  { label: 'Custom Period', value: 'custom' }
];

function GainedTable() {
  const dispatch = useDispatch();
  const { context, updateContext } = useContext(GroupContext);
  const { id, metric, period, startDate, endDate } = context;

  const { data, pageIndex, isFullyLoaded, reloadData } = useLazyLoading({
    resultsPerPage: 50,
    action: handleReload,
    selector: deltasSelectors.getGroupDeltas(id)
  });

  const isLoading = useSelector(deltasSelectors.isFetchingGroupDeltas);
  const isReloading = isLoading && pageIndex === 0;
  const showCustomPeriodInfo = period === 'custom' && startDate && endDate;
  const showPeriodSelectionModal = period === 'custom' && (!startDate || !endDate);

  const metricIndex = METRIC_OPTIONS.findIndex(o => o.value === metric);
  const periodIndex = PERIOD_OPTIONS.findIndex(o => o.value === period);

  const { uniqueKey, columns } = getTableConfig(metric, period);

  function handleMetricSelected(e) {
    updateContext({ metric: e.value });
  }

  function handlePeriodSelected(e) {
    updateContext({ period: e.value });
  }

  function handleCustomPeriodSelected(dates) {
    updateContext({ startDate: dates.startDate, endDate: dates.endDate });
  }

  function handleReload(limit, offset, query) {
    if (!query) return;

    if (period && period !== 'custom') {
      dispatch(deltasActions.fetchGroupPeriodDeltas(id, metric, period, limit, offset));
    } else if (startDate && endDate) {
      dispatch(deltasActions.fetchGroupTimeRangeDeltas(id, metric, startDate, endDate, limit, offset));
    }
  }

  const debouncedReload = useCallback(debounce(reloadData, 500, { leading: true }), [
    id,
    metric,
    period,
    startDate,
    endDate
  ]);

  // When the selected metric and period changes, reload the gains
  useEffect(() => debouncedReload({}), [debouncedReload, id, metric, period]);

  return (
    <>
      <div className="options-bar">
        <Selector
          options={METRIC_OPTIONS}
          selectedIndex={metricIndex}
          onSelect={handleMetricSelected}
          search
        />
        <Selector options={PERIOD_OPTIONS} selectedIndex={periodIndex} onSelect={handlePeriodSelected} />
      </div>
      <SlowLoadingInfo />
      {showCustomPeriodInfo && (
        <CustomPeriodInfo
          startDate={startDate}
          endDate={endDate}
          onChangePeriodClicked={() => updateContext({ startDate: null, endDate: null })}
        />
      )}
      {isReloading ? (
        <TablePlaceholder size={20} />
      ) : (
        <Table uniqueKeySelector={uniqueKey} rows={data} columns={columns} />
      )}
      {!isFullyLoaded && <b className="loading-indicator">Loading...</b>}
      {showPeriodSelectionModal && (
        <CustomPeriodSelectionModal
          onConfirm={handleCustomPeriodSelected}
          onCancel={() => updateContext({ period: DEFAULT_PERIOD })}
        />
      )}
    </>
  );
}

function SlowLoadingInfo() {
  return (
    <div className="deltas-warning">
      <img src="/img/icons/warn_orange.svg" alt="" />
      <span>
        Please hold. Group gains are now calculated in real time and might take a while to load,
        especially for bigger groups.
      </span>
    </div>
  );
}

function CustomPeriodInfo({ startDate, endDate, onChangePeriodClicked }) {
  return (
    <div className="deltas-warning -info">
      <img src="/img/icons/warn_blue.svg" alt="" />
      <span>
        {`Showing group gains from ${formatDate(startDate)} to ${formatDate(endDate)}.`}
        <br />
        <button type="button" onClick={onChangePeriodClicked}>
          Click here to change
        </button>
      </span>
    </div>
  );
}

function getTableConfig(metric, period) {
  const TABLE_CONFIG = {
    uniqueKey: row => `${row.player.id}-${metric}-${period}`,
    columns: [
      {
        key: 'rank'
      },
      {
        key: 'displayName',
        label: 'Name',
        className: () => '-primary',
        transform: (_, { player }) => (
          <Link to={`/players/${player.username}`}>
            <PlayerTag
              name={player.displayName}
              type={player.type}
              flagged={player.flagged}
              country={player.country}
            />
          </Link>
        )
      },
      {
        key: 'gained',
        transform: val => <NumberLabel value={val} isColored isSigned />
      },
      {
        key: 'updatedAt',
        label: 'Last updated',
        transform: (_, row) => `${durationBetween(row.player.updatedAt, new Date(), 2, true)} ago`
      }
    ]
  };

  return TABLE_CONFIG;
}

CustomPeriodInfo.propTypes = {
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
  onChangePeriodClicked: PropTypes.func.isRequired
};

export default GainedTable;
