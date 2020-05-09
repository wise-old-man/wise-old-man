import React from 'react';
import PropTypes from 'prop-types';
import TableList from '../../../../components/TableList';
import { capitalize, getMetricIcon, formatDate } from '../../../../utils';
import { SKILLS } from '../../../../config';
import './PlayerAchievementsWidget.scss';

function getIcon(type) {
  for (let i = 0; i < SKILLS.length; i++) {
    if (type.includes(SKILLS[i])) {
      return getMetricIcon(SKILLS[i], true);
    }
  }

  if (type === 'Maxed combat') {
    return getMetricIcon('combat', true);
  }

  return getMetricIcon('overall', true);
}

function filterAchievements(achievements, type) {
  const isExp = t => /^([0-9]{1,3})(m|M)/.test(t) || t.endsWith('experience');
  const isLvl = t => t.startsWith('99');

  if (type === 'experience') {
    return achievements.filter(a => isExp(a.type));
  }

  if (type === 'levels') {
    return achievements.filter(a => isLvl(a.type));
  }

  return achievements.filter(a => !isExp(a.type) && !isLvl(a.type));
}

const TABLE_CONFIG = {
  uniqueKey: row => row.type,
  columns: [
    {
      key: 'type',
      className: () => '-primary',
      transform: value => (
        <div className="metric-tag">
          <img src={getIcon(value)} alt="" />
          <span>{capitalize(value)}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      transform: (value, row) => {
        if (row.unknownDate) {
          return 'Unknown date';
        }

        return value ? formatDate(value, 'DD-MM-YYYY') : 'To be achieved';
      },
      className: value => (value === 'To be achieved' ? '-negative' : '')
    }
  ]
};

function PlayerAchievementsWidget({ achievements, type }) {
  if (!achievements) {
    return null;
  }

  const filteredAchievements = filterAchievements(achievements, type);

  return (
    <div className="player-achievements-widget">
      <div className="widget-header">
        <b className="widget-title">{capitalize(type)}</b>
      </div>
      <div className="widget-body">
        <TableList
          rows={filteredAchievements}
          uniqueKeySelector={TABLE_CONFIG.uniqueKey}
          columns={TABLE_CONFIG.columns}
        />
      </div>
    </div>
  );
}

PlayerAchievementsWidget.propTypes = {
  achievements: PropTypes.arrayOf(PropTypes.shape).isRequired,
  type: PropTypes.string.isRequired
};

export default React.memo(PlayerAchievementsWidget);
