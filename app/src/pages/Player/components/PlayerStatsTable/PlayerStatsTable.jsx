import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Table from '../../../../components/Table';
import TableListPlaceholder from '../../../../components/TableListPlaceholder';
import NumberLabel from '../../../../components/NumberLabel';
import { capitalize, getSkillIcon, getLevel, getVirtualLevel } from '../../../../utils';

function PlayerStatsTable({ player, isLoading }) {
  if (isLoading) {
    return <TableListPlaceholder size={20} />;
  }

  const { latestSnapshot } = player;

  if (!latestSnapshot) {
    return null;
  }

  const filteredSnapshot = _.omit(latestSnapshot, ['createdAt', 'importedAt']);

  const totalLevel = _.filter(filteredSnapshot, (val, key) => key !== 'overall')
    .map(skill => getLevel(skill.experience))
    .reduce((acc, cur) => acc + cur);
  
  const virtualTotalLevel = _.filter(filteredSnapshot, (val, key) => key !== 'overall')
    .map(skill => getVirtualLevel(skill.experience))
    .reduce((acc, cur) => acc + cur);

  // Display virtual total level if there are any
  const totalLevelString = virtualTotalLevel < totalLevel ? totalLevel : `${totalLevel} (${virtualTotalLevel})`;

  const rows = _.map(filteredSnapshot, (value, key) => {
    const currentLevel = getLevel(value.experience);
    const currentVirtualLevel = getVirtualLevel(value.experience);

    // Display the virtual level if above level 99
    const currentLevelString = currentVirtualLevel < 100 ? currentLevel : `${currentLevel} (${currentVirtualLevel})`;

    return {
      skill: key,
      level: key === 'overall' ? totalLevelString : currentLevelString,
      experience: value.experience,
      rank: value.rank,
      ehp: 0
    }
  });

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
    {
      key: 'level'
    },
    {
      key: 'experience',
      transform: val => <NumberLabel value={val} />
    },
    {
      key: 'rank',
      className: () => '-break-small',
      transform: val => <NumberLabel value={val} />
    },
    {
      key: 'EHP',
      get: row => row.ehp,
      className: () => '-break-small'
    }
  ];

  return <Table rows={rows} columns={columns} />;
}

PlayerStatsTable.propTypes = {
  player: PropTypes.shape().isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default React.memo(PlayerStatsTable);
