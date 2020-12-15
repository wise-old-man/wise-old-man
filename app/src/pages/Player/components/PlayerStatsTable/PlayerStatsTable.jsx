import React from 'react';
import PropTypes from 'prop-types';
import Table from '../../../../components/Table';
import TablePlaceholder from '../../../../components/TablePlaceholder';
import NumberLabel from '../../../../components/NumberLabel';
import TextLabel from '../../../../components/TextLabel';
import { getMetricIcon, getLevel, getMetricName, getMinimumBossKc, round } from '../../../../utils';
import { SKILLS, BOSSES, ACTIVITIES } from '../../../../config';

function renderSkillsTable(snapshot, showVirtualLevels) {
  const totalLevel = SKILLS.filter(skill => skill !== 'overall')
    .map(s => getLevel(snapshot[s].experience, showVirtualLevels))
    .reduce((acc, cur) => acc + cur);

  const rows = SKILLS.map(skill => {
    const { experience, rank, ehp } = snapshot[skill];
    const level = skill === 'overall' ? totalLevel : getLevel(experience, showVirtualLevels);

    return {
      metric: skill,
      level,
      experience,
      rank,
      ehp: round(ehp, 2)
    };
  });

  // Add special case for EHP
  rows.push({
    metric: 'ehp',
    level: '',
    experience: '',
    ehp: round(snapshot.ehp.value, 2),
    rank: snapshot.ehp.rank
  });

  const uniqueKeySelector = row => row.metric;

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
      key: 'experience',
      transform: val => <NumberLabel value={val} />
    },
    {
      key: 'level'
    },
    {
      key: 'rank',
      className: () => '-break-small',
      transform: val => <NumberLabel value={val} />
    },
    {
      key: 'ehp',
      label: 'EHP',
      className: () => '-break-small'
    }
  ];

  return <Table rows={rows} columns={columns} uniqueKeySelector={uniqueKeySelector} />;
}

function renderBossesTable(snapshot) {
  const rows = BOSSES.map(boss => {
    const { kills, rank, ehb } = snapshot[boss];
    return { metric: boss, kills, rank, ehb: round(ehb, 2) };
  });

  // Add special case for EHB
  rows.push({
    metric: 'ehb',
    kills: '',
    rank: snapshot.ehb.rank,
    ehb: round(snapshot.ehb.value, 2)
  });

  const uniqueKeySelector = row => row.metric;

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
      transform: (val, row) => {
        const minKc = getMinimumBossKc(row.metric);
        const metricName = getMetricName(row.metric);

        return val === -1 ? (
          <TextLabel
            value={`< ${minKc}`}
            popupValue={`The Hiscores only start tracking ${metricName} kills after ${minKc} kc`}
          />
        ) : (
          <NumberLabel value={val} />
        );
      }
    },
    {
      key: 'rank',
      className: () => '-break-small',
      transform: val => {
        return val === -1 ? (
          <TextLabel value="---" popupValue="Unranked" />
        ) : (
          <NumberLabel value={val} />
        );
      }
    },
    {
      key: 'EHB',
      get: row => row.ehb,
      className: () => '-break-small'
    }
  ];

  return <Table rows={rows} columns={columns} uniqueKeySelector={uniqueKeySelector} />;
}

function renderActivitiesTable(snapshot) {
  const rows = ACTIVITIES.map(activity => {
    const { score, rank } = snapshot[activity];
    return { metric: activity, score, rank };
  });

  const uniqueKeySelector = row => row.metric;

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

  return <Table rows={rows} columns={columns} uniqueKeySelector={uniqueKeySelector} />;
}

function PlayerStatsTable({ player, showVirtualLevels, isLoading, metricType }) {
  if (isLoading) {
    return <TablePlaceholder size={20} />;
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
