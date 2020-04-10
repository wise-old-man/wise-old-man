import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Table from '../../../../components/Table';
import { getLevel, getSkillIcon, capitalize, formatNumber } from '../../../../utils';

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

function getColoredClass(value, lowThreshold) {
  if (value === 0) {
    return '';
  }

  if (value < 0) {
    return '-negative';
  }

  if (value < lowThreshold) {
    return '-low-positive';
  }

  return '-positive';
}

function transformNumber(value) {
  const formattedValue = formatNumber(value, true);
  return value > 0 ? `+${formattedValue}` : formattedValue;
}

function PlayerDeltasTable({ deltas, period }) {
  if (!deltas) {
    return null;
  }

  const rows = calculateRows(deltas[period].data);

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
      key: 'level',
      label: 'Levels',
      className: value => `-break-small ${getColoredClass(value, 0)}`,
      transform: transformNumber
    },
    {
      key: 'experience',
      label: 'Exp.',
      className: value => getColoredClass(value, 50000),
      transform: transformNumber
    },
    {
      key: 'rank',
      className: value => `-break-small ${getColoredClass(value, 10)}`,
      transform: transformNumber
    },
    {
      key: 'EHP',
      get: row => row.ehp,
      className: value => getColoredClass(value, 1),
      transform: transformNumber
    }
  ];

  return <Table rows={rows} columns={columns} />;
}

PlayerDeltasTable.propTypes = {
  deltas: PropTypes.shape().isRequired,
  period: PropTypes.string.isRequired
};

export default React.memo(PlayerDeltasTable);
