import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Table from '../../../../components/Table';
import { capitalize, getSkillIcon, getLevel } from '../../../../utils';

function PlayerStatsTable({ player }) {
  const { latestSnapshot } = player;

  if (!latestSnapshot) {
    return null;
  }

  const filteredSnapshot = _.omit(latestSnapshot, ['createdAt', 'importedAt']);

  const totalLevel = _.filter(filteredSnapshot, (val, key) => key !== 'overall')
    .map(skill => getLevel(skill.experience))
    .reduce((acc, cur) => acc + cur);

  const rows = _.map(filteredSnapshot, (value, key) => ({
    skill: key,
    level: key === 'overall' ? totalLevel : getLevel(value.experience),
    experience: value.experience,
    rank: value.rank,
    ehp: 0
  }));

  // Column config
  const columns = [
    {
      key: 'skill',
      className: () => '-primary',
      transform: value => (
        <div className="skill-tag">
          <img src={getSkillIcon(value, true)} alt="" />
          <span>{capitalize(value)}</span>
        </div>
      )
    },
    { key: 'level' },
    { key: 'experience', formatNumbers: true },
    { key: 'rank', formatNumbers: true, className: () => '-break-small' },
    { key: 'EHP', get: row => row.ehp, className: () => '-break-small' }
  ];

  return <Table rows={rows} columns={columns} />;
}

PlayerStatsTable.propTypes = {
  player: PropTypes.shape().isRequired
};

export default React.memo(PlayerStatsTable);
