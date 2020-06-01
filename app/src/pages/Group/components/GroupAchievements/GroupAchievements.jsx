import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import PlayerTag from '../../../../components/PlayerTag';
import Table from '../../../../components/Table';
import { getMetricIcon, formatDate } from '../../../../utils';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'displayName',
      get: row => row.player.displayName,
      className: () => '-primary',
      transform: (value, row) => (
        <Link to={`/players/${row.player.id}/achievements`}>
          <PlayerTag name={value} type={row.player.type} />
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

function GroupAchievements({ achievements }) {
  return (
    <>
      <span className="widget-label">Most recent achievements</span>
      <Table
        uniqueKeySelector={TABLE_CONFIG.uniqueKey}
        rows={achievements}
        columns={TABLE_CONFIG.columns}
        listStyle
      />
    </>
  );
}

GroupAchievements.defaultProps = {
  achievements: []
};

GroupAchievements.propTypes = {
  achievements: PropTypes.arrayOf(PropTypes.shape())
};

export default GroupAchievements;
