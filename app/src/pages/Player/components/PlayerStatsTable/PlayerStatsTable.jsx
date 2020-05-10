import React from 'react';
import PropTypes from 'prop-types';
import Table from '../../../../components/Table';
import TableListPlaceholder from '../../../../components/TableListPlaceholder';
import NumberLabel from '../../../../components/NumberLabel';
import { getMetricIcon, getLevel, getMetricName } from '../../../../utils';
import { SKILLS, BOSSES, ACTIVITIES } from '../../../../config';

function renderSkillsTable(snapshot, showVirtualLevels) {
  const totalLevel = SKILLS.filter(skill => skill !== 'overall')
    .map(s => getLevel(snapshot[s].experience, showVirtualLevels))
    .reduce((acc, cur) => acc + cur);

  const rows = SKILLS.map(skill => {
    const { experience, rank } = snapshot[skill];
    const level = skill === 'overall' ? totalLevel : getLevel(experience);
    return { metric: skill, level, experience, rank, ehp: 0 };
  });

  // Column config
  const columns = [
    {
      key: 'metric',
      label: 'Skill',
      className: () => '-primary',
      transform: value => (
        <div className="metric-tag">
          <img src={getMetricIcon(value, true)} alt="" />
          <span>{getMetricName(value)}</span>
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

function renderBossesTable(snapshot) {
  const rows = BOSSES.map(boss => {
    const { kills, rank } = snapshot[boss];
    return { metric: boss, kills, rank, ehb: 0 };
  });

  // Column config
  const columns = [
    {
      key: 'metric',
      label: 'Boss',
      className: () => '-primary',
      transform: value => (
        <div className="metric-tag">
          <img src={getMetricIcon(value, true)} alt="" />
          <span>{getMetricName(value)}</span>
        </div>
      )
    },
    {
      key: 'kills',
      transform: val => <NumberLabel value={val} />
    },
    {
      key: 'rank',
      className: () => '-break-small',
      transform: val => <NumberLabel value={val} />
    },
    {
      key: 'EHB',
      get: row => row.ehb,
      className: () => '-break-small'
    }
  ];

  return <Table rows={rows} columns={columns} />;
}

function renderActivitiesTable(snapshot) {
  const rows = ACTIVITIES.map(activity => {
    const { score, rank } = snapshot[activity];
    return { metric: activity, score, rank };
  });

  // Column config
  const columns = [
    {
      key: 'metric',
      label: 'Activity',
      className: () => '-primary',
      transform: value => (
        <div className="metric-tag">
          <img src={getMetricIcon(value, true)} alt="" />
          <span>{getMetricName(value)}</span>
        </div>
      )
    },
    {
      key: 'score',
      transform: val => <NumberLabel value={val} />
    },
    {
      key: 'rank',
      className: () => '-break-small',
      transform: val => <NumberLabel value={val} />
    }
  ];

  return <Table rows={rows} columns={columns} />;
}

function PlayerStatsTable({ player, showVirtualLevels, isLoading, metricType }) {
  if (isLoading) {
    return <TableListPlaceholder size={20} />;
  }

  const { latestSnapshot } = player;

  if (!latestSnapshot) {
    return null;
  }

  if (metricType === 'skilling') {
    return renderSkillsTable(latestSnapshot, showVirtualLevels);
  }

  if (metricType === 'activities') {
    return renderActivitiesTable(latestSnapshot);
  }

  return renderBossesTable(latestSnapshot);
}

PlayerStatsTable.propTypes = {
  player: PropTypes.shape().isRequired,
  showVirtualLevels: PropTypes.bool.isRequired,
  metricType: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default React.memo(PlayerStatsTable);
