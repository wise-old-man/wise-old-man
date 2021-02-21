import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { achievementActions, achievementSelectors } from 'redux/achievements';
import { Table, TablePlaceholder, PlayerTag } from 'components';
import { getMetricIcon, formatDate } from 'utils';
import { useLazyLoading } from 'hooks';
import { GroupContext } from '../context';

const TABLE_CONFIG = {
  uniqueKey: row => `${row.player.id}-${row.type}`,
  columns: [
    {
      key: 'displayName',
      get: row => row.player.displayName,
      className: () => '-primary',
      transform: (value, row) => (
        <Link to={`/players/${row.player.username}/achievements`}>
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
      key: 'metric',
      className: () => '-no-padding -break-small',
      transform: value => <img src={getMetricIcon(value, true)} alt="" />
    },
    {
      key: 'name',
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
  const dispatch = useDispatch();

  const { context } = useContext(GroupContext);
  const { id } = context;

  const { isFullyLoaded, pageIndex, reloadData } = useLazyLoading({
    resultsPerPage: 20,
    action: handleReload,
    selector: state => achievementSelectors.getGroupAchievements(state, id)
  });

  const achievements = useSelector(state => achievementSelectors.getGroupAchievements(state, id));
  const isLoading = useSelector(achievementSelectors.isFetchingGroupAchievements);
  const isReloading = isLoading && pageIndex === 0;

  function handleReload(limit, offset) {
    dispatch(achievementActions.fetchGroupAchievements(id, limit, offset));
  }

  // When the selected metric changes, reload the achievements
  useEffect(reloadData, [id]);

  return (
    <>
      <span className="widget-label">Most recent achievements</span>
      {isReloading ? (
        <TablePlaceholder size={20} />
      ) : (
        <Table
          uniqueKeySelector={TABLE_CONFIG.uniqueKey}
          rows={achievements}
          columns={TABLE_CONFIG.columns}
          listStyle
        />
      )}
      {!isFullyLoaded && <b className="loading-indicator">Loading...</b>}
    </>
  );
}

export default AchievementsTable;
