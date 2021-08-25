import React, { useCallback, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { debounce } from 'lodash';
import { Selector, Table, PlayerTag, NumberLabel, TablePlaceholder } from 'components';
import { isSkill, durationBetween, getMeasure, getMetricName, getMetricIcon } from 'utils';
import { hiscoresSelectors, hiscoresActions } from 'redux/hiscores';
import { useLazyLoading } from 'hooks';
import { ALL_METRICS } from 'config';
import { GroupContext } from '../context';

const METRIC_OPTIONS = ALL_METRICS.map(metric => ({
  label: getMetricName(metric),
  icon: getMetricIcon(metric, true),
  value: metric
}));

function HiscoresTable() {
  const dispatch = useDispatch();
  const { context, updateContext } = useContext(GroupContext);
  const { id, metric } = context;

  const { data, pageIndex, isFullyLoaded, reloadData } = useLazyLoading({
    resultsPerPage: 50,
    action: handleReload,
    selector: hiscoresSelectors.getGroupHiscores(id)
  });

  const isLoading = useSelector(hiscoresSelectors.isFetching);
  const isReloading = isLoading && pageIndex === 0;

  const metricIndex = METRIC_OPTIONS.findIndex(o => o.value === metric);
  const { uniqueKey, columns } = getTableConfig(metric);

  function handleMetricSelected(e) {
    updateContext({ metric: e.value });
  }

  function handleReload(limit, offset, query) {
    if (!query) return;
    dispatch(hiscoresActions.fetchGroupHiscores(id, metric, limit, offset));
  }

  const debouncedReload = useCallback(debounce(reloadData, 500, { leading: true }), [id, metric]);

  // When the selected metric changes, reload the hiscores
  useEffect(() => debouncedReload({}), [debouncedReload, id, metric]);

  return (
    <>
      <Selector
        options={METRIC_OPTIONS}
        selectedIndex={metricIndex}
        onSelect={handleMetricSelected}
        search
      />
      {isReloading ? (
        <TablePlaceholder size={20} />
      ) : (
        <Table uniqueKeySelector={uniqueKey} rows={data} columns={columns} />
      )}
      {!isFullyLoaded && <b className="loading-indicator">Loading...</b>}
    </>
  );
}

function getTableConfig(metric) {
  const TABLE_CONFIG = {
    uniqueKey: row => `${row.player.id}-${row.rank}`,
    columns: [
      {
        key: 'groupRank',
        label: 'Rank'
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
        key: getMeasure(metric),
        transform: val => <NumberLabel value={val} />
      },
      {
        key: 'updatedAt',
        label: 'Last updated',
        transform: (value, row) => `${durationBetween(row.player.updatedAt, new Date(), 2, true)} ago`
      }
    ]
  };

  if (isSkill(metric)) {
    TABLE_CONFIG.columns.splice(3, 0, {
      key: 'level'
    });
  }

  return TABLE_CONFIG;
}

export default HiscoresTable;
