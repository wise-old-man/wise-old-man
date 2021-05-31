import React, { useMemo, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { leaderboardsSelectors } from 'redux/leaderboards';
import { Table, PlayerTag, TablePlaceholder } from 'components';
import { durationBetween, formatNumber } from 'utils';
import { LeaderboardContext } from '../context';

function List() {
  const { context } = useContext(LeaderboardContext);
  const { metric } = context;

  const tableConfig = useMemo(() => getTableConfig(metric), [metric]);

  // Memoized redux variables
  const leaderboards = useSelector(leaderboardsSelectors.getLeaderboards);
  const isLoading = useSelector(leaderboardsSelectors.isFetching);

  if (isLoading && (!leaderboards || leaderboards.length === 0)) {
    return <TablePlaceholder size={20} />;
  }

  return (
    <Table
      uniqueKeySelector={tableConfig.uniqueKey}
      columns={tableConfig.columns}
      rows={leaderboards}
      listStyle
    />
  );
}

function getTableConfig(metric) {
  return {
    uniqueKey: row => row.id,
    columns: [
      {
        key: 'rank',
        label: 'Rank',
      },
      {
        key: 'displayName',
        label: 'Name',
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={`/players/${row.username}`}>
            <PlayerTag
              name={row.displayName}
              type={row.type}
              flagged={row.flagged}
              country={row.country}
            />
          </Link>
        )
      },
      {
        key: metric,
        transform: val => `${formatNumber(val)} hours`
      },
      {
        key: 'updatedAt',
        label: 'Last updated',
        transform: (value, row) => `Updated ${durationBetween(row.updatedAt, new Date(), 2, true)} ago`
      }
    ]
  };
}

export default List;
