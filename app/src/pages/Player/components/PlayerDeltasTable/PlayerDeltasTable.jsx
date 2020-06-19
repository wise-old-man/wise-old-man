import React, { useCallback } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Table from '../../../../components/Table';
import NumberLabel from '../../../../components/NumberLabel';
import { getLevel, getMetricIcon, getMetricName } from '../../../../utils';
import { SKILLS, BOSSES, ACTIVITIES } from '../../../../config';

function getSkillsTable(delta) {
  const totalLevelDiff = SKILLS.filter(skill => skill !== 'overall')
    .map(s => getLevel(delta[s].experience.end) - getLevel(delta[s].experience.start))
    .reduce((acc, cur) => acc + cur);

  const levelDiff = exps => getLevel(exps.end) - getLevel(exps.start);

  const rows = SKILLS.map(skill => {
    const { experience, rank } = delta[skill];
    const level = skill === 'overall' ? totalLevelDiff : levelDiff(experience);
    return { metric: skill, level, experience: experience.gained, rank: -rank.gained, ehp: 0 };
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

  return [rows, columns, uniqueKeySelector];
}

function getBossesTable(delta) {
  const rows = BOSSES.map(boss => {
    const { kills, rank } = delta[boss];
    return { metric: boss, kills: kills.gained, rank: -rank.gained, ehb: 0 };
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
      key: 'EHB',
      get: row => row.ehb
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

function PlayerDeltasTable({ deltas, period, metricType, highlightedMetric, onMetricSelected }) {
  const { data } = deltas[period];

  const [rows, columns, uniqueKeySelector] = getTableData(data, metricType);
  const highlightedIndex = rows.map(r => r.metric).indexOf(highlightedMetric);

  const warning = _.filter(data, ({ rank }) => rank.start !== rank.end && rank.gained === 0).length > 0;

  function handleRowClicked(index, sortedRows) {
    if (sortedRows && sortedRows[index]) {
      onMetricSelected(sortedRows[index].metric);
    }
  }

  const onRowClicked = useCallback(handleRowClicked, [rows, metricType]);

  if (!deltas || !period || !metricType) {
    return null;
  }

  return (
    <>
      {warning && (
        <div className="deltas-warning">
          <img src="/img/icons/warn_orange.svg" alt="" />
          <span>
            If your skill ranks wrongfuly show 0 gained, don&apos;t worry, this was caused by a bug and
            it will go away on its own within a few days/weeks.
          </span>
        </div>
      )}
      <Table
        rows={rows}
        columns={columns}
        uniqueKeySelector={uniqueKeySelector}
        onRowClicked={onRowClicked}
        highlightedIndex={highlightedIndex}
        metricType={metricType}
      />
    </>
  );
}

PlayerDeltasTable.propTypes = {
  deltas: PropTypes.shape().isRequired,
  period: PropTypes.string.isRequired,
  metricType: PropTypes.string.isRequired,
  highlightedMetric: PropTypes.string.isRequired,
  onMetricSelected: PropTypes.func.isRequired
};

export default React.memo(PlayerDeltasTable);
