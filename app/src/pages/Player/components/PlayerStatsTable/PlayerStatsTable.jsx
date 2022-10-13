import React from 'react';
import PropTypes from 'prop-types';
import { SKILLS, BOSSES, ACTIVITIES, MetricProps, getLevel } from '@wise-old-man/utils';
import { Table, TablePlaceholder, NumberLabel, TextLabel } from 'components';
import { getMetricIcon, round } from 'utils';

function renderSkillsTable(snapshot, showVirtualLevels) {
  const totalLevel = SKILLS.filter(skill => skill !== 'overall')
    .map(s => getLevel(snapshot.data.skills[s].experience, showVirtualLevels))
    .reduce((acc, cur) => acc + cur);

  const rows = SKILLS.map(skill => {
    const { experience, rank, ehp } = snapshot.data.skills[skill];
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
    ehp: round(snapshot.data.computed.ehp.value, 2),
    rank: snapshot.data.computed.ehp.rank
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
          <span>{MetricProps[value].name}</span>
        </div>
      )
    },
    {
      key: 'experience',
      transform: val => {
        return val === -1 ? (
          <TextLabel value="---" popupValue="Unranked" />
        ) : (
          <NumberLabel value={val} />
        );
      }
    },
    {
      key: 'level'
    },
    {
      key: 'rank',
      transform: val => {
        return val === -1 ? (
          <TextLabel value="---" popupValue="Unranked" />
        ) : (
          <NumberLabel value={val} />
        );
      }
    },
    {
      key: 'ehp',
      label: 'EHP'
    }
  ];

  return <Table rows={rows} columns={columns} uniqueKeySelector={uniqueKeySelector} />;
}

function renderBossesTable(snapshot) {
  const rows = BOSSES.map(boss => {
    const { kills, rank, ehb } = snapshot.data.bosses[boss];
    return { metric: boss, kills, rank, ehb: round(ehb, 2) };
  });

  // Add special case for EHB
  rows.push({
    metric: 'ehb',
    kills: '',
    rank: snapshot.data.computed.ehb.rank,
    ehb: round(snapshot.data.computed.ehb.value, 2)
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
          <span>{MetricProps[value].name}</span>
        </div>
      )
    },
    {
      key: 'kills',
      transform: (val, row) => {
        const { name, minimumValue } = MetricProps[row.metric];

        return val === -1 ? (
          <TextLabel
            value={`< ${minimumValue}`}
            popupValue={`The Hiscores only start tracking ${name} kills after ${minimumValue} kc`}
          />
        ) : (
          <NumberLabel value={val} />
        );
      }
    },
    {
      key: 'rank',
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
      get: row => row.ehb
    }
  ];

  return <Table rows={rows} columns={columns} uniqueKeySelector={uniqueKeySelector} />;
}

function renderActivitiesTable(snapshot) {
  const rows = ACTIVITIES.map(activity => {
    const { score, rank } = snapshot.data.activities[activity];
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
          <span>{MetricProps[value].name}</span>
        </div>
      )
    },
    {
      key: 'score',
      transform: val => {
        return val === -1 ? (
          <TextLabel value="---" popupValue="Unranked" />
        ) : (
          <NumberLabel value={val} />
        );
      }
    },
    {
      key: 'rank',
      transform: val => {
        return val === -1 ? (
          <TextLabel value="---" popupValue="Unranked" />
        ) : (
          <NumberLabel value={val} />
        );
      }
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
