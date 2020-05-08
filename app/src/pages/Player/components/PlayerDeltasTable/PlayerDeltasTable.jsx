import React from 'react';
import PropTypes from 'prop-types';
import Table from '../../../../components/Table';
import NumberLabel from '../../../../components/NumberLabel';
import { getLevel, getSkillIcon } from '../../../../utils';
import { SKILLS, BOSSES, ACTIVITIES, getMetricName } from '../../../../config';

function renderSkillsTable(delta) {
  const totalLevelDiff = SKILLS.filter(skill => skill !== 'overall')
    .map(s => getLevel(delta[s].experience.end) - getLevel(delta[s].experience.start))
    .reduce((acc, cur) => acc + cur);

  const levelDiff = exps => getLevel(exps.end) - getLevel(exps.start);

  const rows = SKILLS.map(skill => {
    const { experience, rank } = delta[skill];
    const level = skill === 'overall' ? totalLevelDiff : levelDiff(experience);
    return { metric: skill, level, experience: experience.delta, rank: -rank.delta, ehp: 0 };
  });

  // Column config
  const columns = [
    {
      key: 'metric',
      label: 'Skill',
      className: () => '-primary',
      transform: value => (
        <div className="metric-tag">
          <img src={getSkillIcon(value, true)} alt="" />
          <span>{getMetricName(value)}</span>
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
}

function renderBossesTable(delta) {
  const rows = BOSSES.map(boss => {
    const { kills, rank } = delta[boss];
    return { metric: boss, kills: kills.delta, rank: -rank.delta, ehb: 0 };
  });

  // Column config
  const columns = [
    {
      key: 'metric',
      label: 'Boss',
      className: () => '-primary',
      transform: value => (
        <div className="metric-tag">
          <span>{getMetricName(value)}</span>
        </div>
      )
    },
    {
      key: 'kills',
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={20} />
    },
    {
      key: 'rank',
      className: () => `-break-small`,
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={10} />
    },
    {
      key: 'EHB',
      get: row => row.ehb
    }
  ];

  return <Table rows={rows} columns={columns} />;
}

function renderActivitiesTable(delta) {
  const rows = ACTIVITIES.map(activity => {
    const { score, rank } = delta[activity];
    return { metric: activity, score: score.delta, rank: -rank.delta };
  });

  // Column config
  const columns = [
    {
      key: 'metric',
      label: 'Activity',
      className: () => '-primary',
      transform: value => (
        <div className="metric-tag">
          <span>{getMetricName(value)}</span>
        </div>
      )
    },
    {
      key: 'score',
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={20} />
    },
    {
      key: 'rank',
      className: () => `-break-small`,
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={10} />
    }
  ];

  return <Table rows={rows} columns={columns} />;
}

function PlayerDeltasTable({ deltas, period, metricType }) {
  if (!deltas || !period || !metricType) {
    return null;
  }

  if (metricType === 'skilling') {
    return renderSkillsTable(deltas[period].data);
  }

  if (metricType === 'activities') {
    return renderActivitiesTable(deltas[period].data);
  }

  return renderBossesTable(deltas[period].data);
}

PlayerDeltasTable.propTypes = {
  deltas: PropTypes.shape().isRequired,
  period: PropTypes.string.isRequired,
  metricType: PropTypes.string.isRequired
};

export default React.memo(PlayerDeltasTable);
