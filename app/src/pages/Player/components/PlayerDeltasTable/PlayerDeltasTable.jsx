import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Table from '../../../../components/Table';
import NumberLabel from '../../../../components/NumberLabel';
import { getLevel, getSkillIcon, capitalize } from '../../../../utils';

function calculateRows(data) {
  const totalLevelBefore = _.filter(data, (val, key) => key !== 'overall')
    .map(skill => getLevel(skill.experience.start))
    .reduce((acc, cur) => acc + cur);

  const totalLevelAfter = _.filter(data, (val, key) => key !== 'overall')
    .map(skill => getLevel(skill.experience.end))
    .reduce((acc, cur) => acc + cur);

  const totalLevelDiff = totalLevelAfter - totalLevelBefore;

  const levelDiff = exps => getLevel(exps.end) - getLevel(exps.start);

  return _.map(data, (value, key) => ({
    skill: key,
    experience: value.experience.delta,
    level: key === 'overall' ? totalLevelDiff : levelDiff(value.experience),
    // invert the rank gain, as apparently players get confused
    // if their rank gains show up as red when they gained plenty exp
    rank: -value.rank.delta,
    ehp: 0
  }));
}

function PlayerDeltasTable({ deltas, period }) {
  if (!deltas) {
    return null;
  }

  /*
  console.log(deltas, period);

  const rows = calculateRows(deltas[period].data);

  // Column config
  const columns = [
    {
      key: 'skill',
      className: () => '-primary',
      transform: value => (
        <div className="metric-tag">
          <img src={getSkillIcon(value, true)} alt="" />
          <span>{capitalize(value)}</span>
        </div>
      )
    },
    {
      key: 'level',
      label: 'Levels',
      className: () => `-break-small`,
      transform: val => <NumberLabel value={val} isColored isSigned />
    },
    {
      key: 'experience',
      label: 'Exp.',
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={50000} />
    },
    {
      key: 'rank',
      className: () => `-break-small`,
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={10} />
    },
    {
      key: 'EHP',
      get: row => row.ehp
    }
  ];

  return <Table rows={rows} columns={columns} />;
  */
  return null;
}

PlayerDeltasTable.propTypes = {
  deltas: PropTypes.shape().isRequired,
  period: PropTypes.string.isRequired
};

export default React.memo(PlayerDeltasTable);
