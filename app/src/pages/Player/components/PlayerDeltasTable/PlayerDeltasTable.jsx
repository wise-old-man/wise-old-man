import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Table, NumberLabel } from 'components';
import { getLevel, getMetricIcon, getMetricName, round } from 'utils';
import { SKILLS, BOSSES, ACTIVITIES } from 'config';

function PlayerDeltasTable({ deltas, period, metricType, highlightedMetric, onMetricSelected }) {
  const { data } = deltas[period];
  const [rows, columns, uniqueKeySelector] = getTableData(data, metricType);

  function handleRowClicked(index) {
    if (rows && rows[index]) {
      onMetricSelected(rows[index].metric);
    }
  }

  const onRowClicked = useCallback(handleRowClicked, [rows, metricType]);

  if (!deltas || !period || !metricType) {
    return null;
  }

  return (
    <Table
      rows={rows}
      columns={columns}
      uniqueKeySelector={uniqueKeySelector}
      onRowClicked={onRowClicked}
      highlightedRowKey={highlightedMetric}
    />
  );
}

function getSkillsTable(delta) {
  const totalLevelDiff = SKILLS.filter(skill => skill !== 'overall')
    .map(s => getLevel(delta[s].experience.end) - getLevel(delta[s].experience.start))
    .reduce((acc, cur) => acc + cur);

  const levelDiff = exps => getLevel(exps.end) - getLevel(exps.start);

  const rows = SKILLS.map(skill => {
    const { experience, rank, ehp } = delta[skill];
    const level = skill === 'overall' ? totalLevelDiff : levelDiff(experience);

    return {
      metric: skill,
      level,
      experience: experience.gained,
      rank: -rank.gained,
      ehp: round(ehp.gained, 2)
    };
  });

  // Add special case for EHP
  rows.push({
    metric: 'ehp',
    level: '',
    experience: '',
    rank: -delta.ehp.rank.gained,
    ehp: delta.ehp.value.gained
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
      label: 'Exp.',
      transform: (val, row) => {
        const lowThreshold = row.metric === 'ehp' ? 10 : 50000;
        return <NumberLabel value={val} isColored isSigned lowThreshold={lowThreshold} />;
      }
    },
    {
      key: 'rank',
      className: () => `-break-small`,
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={10} />
    },
    {
      key: 'level',
      label: 'Levels',
      className: () => `-break-small`,
      transform: val => <NumberLabel value={val} isColored isSigned />
    },
    {
      key: 'ehp',
      label: 'EHP',
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={3} />
    }
  ];

  return [rows, columns, uniqueKeySelector];
}

function getBossesTable(delta) {
  const rows = BOSSES.map(boss => {
    const { kills, rank, ehb } = delta[boss];

    return {
      metric: boss,
      kills: kills.gained,
      rank: -rank.gained,
      ehb: round(ehb.gained, 2)
    };
  });

  // Add special case for EHB
  rows.push({
    metric: 'ehb',
    level: '',
    kills: '',
    rank: -delta.ehb.rank.gained,
    ehb: delta.ehb.value.gained
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
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={20} />
    },
    {
      key: 'rank',
      className: () => `-break-small`,
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={10} />
    },
    {
      key: 'ehb',
      label: 'EHB',
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={10} />
    }
  ];

  return [rows, columns, uniqueKeySelector];
}

function getActivitiesTable(delta) {
  const rows = ACTIVITIES.map(activity => {
    const { score, rank } = delta[activity];
    return { metric: activity, score: score.gained, rank: -rank.gained };
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
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={20} />
    },
    {
      key: 'rank',
      className: () => `-break-small`,
      transform: val => <NumberLabel value={val} isColored isSigned lowThreshold={10} />
    }
  ];

  return [rows, columns, uniqueKeySelector];
}

function getTableData(delta, metricType) {
  if (metricType === 'skilling') {
    return getSkillsTable(delta);
  }

  if (metricType === 'activities') {
    return getActivitiesTable(delta);
  }

  return getBossesTable(delta);
}

PlayerDeltasTable.propTypes = {
  deltas: PropTypes.shape().isRequired,
  period: PropTypes.string.isRequired,
  metricType: PropTypes.string.isRequired,
  highlightedMetric: PropTypes.string.isRequired,
  onMetricSelected: PropTypes.func.isRequired
};

export default React.memo(PlayerDeltasTable);
