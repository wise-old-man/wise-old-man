import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Table from '../../../../components/Table';
import TableListPlaceholder from '../../../../components/TableListPlaceholder';
import NumberLabel from '../../../../components/NumberLabel';
import { capitalize, getSkillIcon, getLevel, getVirtualLevel } from '../../../../utils';

function PlayerStatsTable({ player, showVirtualLevels, isLoading }) {
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

  const rows = _.map(filteredSnapshot, (value, key) => {
    const level = key === 'overall' ? totalLevel : getLevel(value.experience);
    const virtualLevel = key === 'overall' ? virtualTotalLevel : getVirtualLevel(value.experience);

    return {
      skill: key,
      level: showVirtualLevels ? virtualLevel : level,
      experience: value.experience,
      rank: value.rank,
      ehp: 0
    };
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
  showVirtualLevels: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default React.memo(PlayerStatsTable);
