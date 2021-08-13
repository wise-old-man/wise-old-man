import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { deltasSelectors } from 'redux/deltas';
import { TablePlaceholder, Table, NumberLabel, PlayerTag } from 'components';
import { capitalize, isSkill, isBoss } from 'utils';
import URL from 'utils/url';
import { TopContext } from '../context';

function List({ period }) {
  const { context } = useContext(TopContext);
  const { metric } = context;

  const leaderboard = useSelector(deltasSelectors.getLeaderboards(period));
  const isLoading = useSelector(deltasSelectors.isFetching(period));

  const tableConfig = getTableConfig(metric, period);

  return (
    <>
      <h3 className="period-label">{getLabel(period)}</h3>
      {isLoading && <img className="loading-icon" src="/img/icons/loading.png" alt="" />}
      {!leaderboard ? (
        <TablePlaceholder size={20} />
      ) : (
        <Table
          uniqueKeySelector={tableConfig.uniqueKey}
          columns={tableConfig.columns}
          rows={leaderboard}
          listStyle
        />
      )}
    </>
  );
}

function getLabel(period) {
  if (period === '5min') return '5 Min';
  return capitalize(period);
}

function getTableConfig(metric, period) {
  return {
    uniqueKey: row => row.player.username,
    columns: [
      {
        key: 'rank',
        width: '30',
        transform: rank => <span className="top-rank">{rank}</span>
      },
      {
        key: 'displayName',
        get: row => row.player.displayName,
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={getPlayerURL(row.player.displayName, metric, period)}>
            <PlayerTag
              name={value}
              type={row.player.type}
              flagged={row.player.flagged}
              country={row.player.country}
            />
          </Link>
        )
      },
      {
        key: 'gained',
        width: 90,
        transform: val => <NumberLabel value={val} isColored />
      }
    ]
  };
}

function getPlayerURL(displayName, metric, period) {
  const nextURL = new URL(`/players/${displayName}/gained`);

  if (isSkill(metric) || metric === 'ehp') {
    nextURL.appendToPath('/skilling');
  } else if (isBoss(metric) || metric === 'ehb') {
    nextURL.appendToPath('/bossing');
  } else {
    nextURL.appendToPath('/activities');
  }

  nextURL.appendSearchParam('metric', metric);
  nextURL.appendSearchParam('period', period);

  return nextURL.getPath();
}

List.propTypes = {
  period: PropTypes.string.isRequired
};

export default List;
