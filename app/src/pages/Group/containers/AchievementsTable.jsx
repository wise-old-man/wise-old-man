import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, TablePlaceholder, PlayerTag } from 'components';
import { getMetricIcon, formatDate } from 'utils';
import { achievementSelectors } from 'redux/achievements';
import { GroupContext } from '../context';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'displayName',
      get: row => row.player.displayName,
      className: () => '-primary',
      transform: (value, row) => (
        <Link to={`/players/${row.player.username}/achievements`}>
          <PlayerTag name={value} type={row.player.type} flagged={row.player.flagged} />
        </Link>
      )
    },
    {
      key: 'metric',
      className: () => '-no-padding -break-small',
      transform: value => <img src={getMetricIcon(value, true)} alt="" />
    },
    {
      key: 'type',
      className: () => '-no-padding'
    },
    {
      key: 'createdAt',
      className: () => '-break-medium',
      transform: value => formatDate(value, 'DD MMM, YYYY')
    }
  ]
};

function AchievementsTable() {
  const { context } = useContext(GroupContext);
  const { id } = context;

  const isLoading = useSelector(achievementSelectors.isFetchingGroupAchievements);
  const achievements = useSelector(state => achievementSelectors.getGroupAchievements(state, id));

  return (
    <>
      <span className="widget-label">Most recent achievements</span>
      {isLoading ? (
        <TablePlaceholder size={20} />
      ) : (
        <Table
          uniqueKeySelector={TABLE_CONFIG.uniqueKey}
          rows={achievements}
          columns={TABLE_CONFIG.columns}
          listStyle
        />
      )}
    </>
  );
}

export default AchievementsTable;
