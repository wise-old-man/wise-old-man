import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Selector, Table, PlayerTag, NumberLabel, TablePlaceholder } from 'components';
import { formatDate, getMetricName, getMetricIcon } from 'utils';
import { recordActions, recordSelectors } from 'redux/records';
import { useLazyLoading } from 'hooks';
import { ALL_METRICS } from 'config';
import { GroupContext } from '../context';

const METRIC_OPTIONS = ALL_METRICS.map(metric => ({
  label: getMetricName(metric),
  icon: getMetricIcon(metric, true),
  value: metric
}));

const PERIOD_OPTIONS = [
  { label: '6 Hours', value: '6h' },
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' }
];

function RecordsTable() {
  const dispatch = useDispatch();
  const [selectedMetric, setSelectedMetric] = useState(METRIC_OPTIONS[0].value);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_OPTIONS[2].value);

  const { context } = useContext(GroupContext);
  const { id } = context;

  const { data, pageIndex, isFullyLoaded, reloadData } = useLazyLoading({
    resultsPerPage: 50,
    action: handleReload,
    selector: recordSelectors.getGroupRecords(id)
  });

  const isLoading = useSelector(recordSelectors.isFetchingGroupRecords);
  const isReloading = isLoading && pageIndex === 0;

  const selectedMetricIndex = METRIC_OPTIONS.findIndex(o => o.value === selectedMetric);
  const selectedPeriodIndex = PERIOD_OPTIONS.findIndex(o => o.value === selectedPeriod);
  const { uniqueKey, columns } = getTableConfig(selectedMetric, selectedPeriod);

  function handleMetricSelected(e) {
    setSelectedMetric(e.value);
  }

  function handlePeriodSelected(e) {
    setSelectedPeriod(e.value);
  }

  function handleReload(limit, offset) {
    dispatch(recordActions.fetchGroupRecords(id, selectedMetric, selectedPeriod, limit, offset));
  }

  // When the selected metric changes, reload the records
  useEffect(reloadData, [selectedMetric, selectedPeriod]);

  return (
    <>
      <div className="options-bar">
        <Selector
          options={METRIC_OPTIONS}
          selectedIndex={selectedMetricIndex}
          onSelect={handleMetricSelected}
          search
        />
        <Selector
          options={PERIOD_OPTIONS}
          selectedIndex={selectedPeriodIndex}
          onSelect={handlePeriodSelected}
        />
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
        transform: (value, row) => (
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
        transform: (value, row) => formatDate(row.updatedAt, 'DD MMM, YYYY')
      }
    ]
  };

  return TABLE_CONFIG;
}

export default RecordsTable;
