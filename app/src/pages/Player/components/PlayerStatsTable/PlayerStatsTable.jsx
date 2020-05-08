import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Table from '../../../../components/Table';
import TableListPlaceholder from '../../../../components/TableListPlaceholder';
import NumberLabel from '../../../../components/NumberLabel';
import { capitalize, getSkillIcon, getLevel } from '../../../../utils';
import { SKILLS, isBoss, isActivity, getMetricName } from '../../../../config';

function getSkillsTable(snapshot, showVirtualLevels) {
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

function getBossesTable(snapshot) {
  const rows = _.map(snapshot, (value, key) => ({
    metric: key,
    kills: value.kills,
    rank: value.rank,
    ehb: 0
  })).filter(r => isBoss(r.metric));

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

function getActivitiesTable(snapshot) {
  const rows = _.map(snapshot, (value, key) => ({
    metric: key,
    score: value.score,
    rank: value.rank,
    ehb: 0
  })).filter(r => isActivity(r.metric));

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

  if (!player.latestSnapshot) {
    return null;
  }

  const filteredSnapshot = _.omit(player.latestSnapshot, ['createdAt', 'importedAt']);

  if (metricType === 'skilling') {
    return getSkillsTable(filteredSnapshot, showVirtualLevels);
  }

  if (metricType === 'activities') {
    return getActivitiesTable(filteredSnapshot);
  }

  return getBossesTable(filteredSnapshot);
}

PlayerStatsTable.propTypes = {
  player: PropTypes.shape().isRequired,
  showVirtualLevels: PropTypes.bool.isRequired,
  metricType: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default React.memo(PlayerStatsTable);
