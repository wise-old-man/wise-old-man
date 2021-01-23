import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { recordSelectors } from 'redux/records';
import { TablePlaceholder, Table, NumberLabel, PlayerTag } from 'components';
import { capitalize, isSkill, isBoss, formatDate } from 'utils';
import URL from 'utils/url';
import { RecordsContext } from '../context';

function List({ period }) {
  const { context } = useContext(RecordsContext);
  const { metric } = context;

  const leaderboard = useSelector(recordSelectors.getLeaderboards(period));
  const isLoading = useSelector(recordSelectors.isFetching(period));

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
  if (period === '6h') return '6 Hours';
  return capitalize(period);
}

function getTableConfig(metric) {
  return {
    uniqueKey: row => row.player.username,
    columns: [
      {
        key: 'rank',
        width: '10',
        transform: rank => <span className="record-rank">{rank}</span>
      },
      {
        key: 'displayName',
        get: row => row.player.displayName,
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={getPlayerURL(row.player.username, metric)}>
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
        key: 'updatedAt',
        className: () => '-break-small',
        transform: value => (
          <abbr title={formatDate(value, 'Do MMM YYYY HH:mm')}>
            <span className="record-date">{formatDate(value, "DD MMM 'YY")}</span>
          </abbr>
        )
      },
      {
        key: 'value',
        transform: val => <NumberLabel value={val} isColored />
      }
    ]
  };
}

function getPlayerURL(displayName, metric) {
  const nextURL = new URL(`/players/${displayName}/records`);

  if (isSkill(metric) || metric === 'ehp') {
    nextURL.appendToPath('/skilling');
  } else if (isBoss(metric) || metric === 'ehb') {
    nextURL.appendToPath('/bossing');
  } else {
    nextURL.appendToPath('/activities');
  }

  return nextURL.getPath();
}

List.propTypes = {
  period: PropTypes.string.isRequired
};

export default List;
