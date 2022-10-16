import React, { useCallback, useContext, useEffect } from 'react';
import { PERIODS, METRICS, PeriodProps, MetricProps } from '@wise-old-man/utils';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { debounce } from 'lodash';
import { Selector, Table, PlayerTag, NumberLabel, TablePlaceholder } from 'components';
import { formatDate, getMetricIcon } from 'utils';
import { recordActions, recordSelectors } from 'redux/records';
import { useLazyLoading } from 'hooks';
import { GroupContext } from '../context';

const METRIC_OPTIONS = METRICS.map(metric => ({
  label: MetricProps[metric].name,
  icon: getMetricIcon(metric, true),
  value: metric
}));

const PERIOD_OPTIONS = [...PERIODS.map(period => ({ label: PeriodProps[period].name, value: period }))];

function RecordsTable() {
  const dispatch = useDispatch();
  const { context, updateContext } = useContext(GroupContext);
  const { id, metric, period } = context;

  const { data, pageIndex, isFullyLoaded, reloadData } = useLazyLoading({
    resultsPerPage: 50,
    action: handleReload,
    selector: recordSelectors.getGroupRecords(id)
  });

  const isLoading = useSelector(recordSelectors.isFetchingGroupRecords);
  const isReloading = isLoading && pageIndex === 0;

  const metricIndex = METRIC_OPTIONS.findIndex(o => o.value === metric);
  const periodIndex = PERIOD_OPTIONS.findIndex(o => o.value === period);
  const { uniqueKey, columns } = getTableConfig(metric, period);

  function handleMetricSelected(e) {
    updateContext({ metric: e.value });
  }

  function handlePeriodSelected(e) {
    updateContext({ period: e.value });
  }

  function handleReload(limit, offset, query) {
    if (!query) return;
    dispatch(recordActions.fetchGroupRecords(id, metric, period, limit, offset));
  }

  const debouncedReload = useCallback(debounce(reloadData, 500, { leading: true }), [
    id,
    metric,
    period
  ]);

  // When the selected metric and period changes, reload the records
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
      {isReloading ? (
        <TablePlaceholder size={20} />
      ) : (
        <Table uniqueKeySelector={uniqueKey} rows={data} columns={columns} />
      )}
      {!isFullyLoaded && <b className="loading-indicator">Loading...</b>}
    </>
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
        get: row => row.player.displayName,
        transform: (_, row) => (
          <Link to={`/players/${row.player.username}`}>
            <PlayerTag
              name={row.player.displayName}
              type={row.player.type}
              flagged={row.player.flagged}
              country={row.player.country}
            />
          </Link>
        )
      },
      {
        key: 'value',
        transform: val => <NumberLabel value={val} isColored isSigned />
      },
      {
        key: 'updatedAt',
        label: 'Date',
        get: row => row.player.updatedAt,
        transform: val => formatDate(val, 'DD MMM, YYYY')
      }
    ]
  };

  return TABLE_CONFIG;
}

export default RecordsTable;
