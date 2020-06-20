import React from 'react';
import PropTypes from 'prop-types';
import Table from '../../../../components/Table';
import TablePlaceholder from '../../../../components/TablePlaceholder';
import NumberLabel from '../../../../components/NumberLabel';
import { getMetricIcon, getLevel, getMetricName } from '../../../../utils';
import { SKILLS, BOSSES, ACTIVITIES } from '../../../../config';
import './GroupStatistics.scss';

function getValue(row) {
  if (row.experience) {
    return row.experience;
  }

  if (row.kills) {
    return row.kills;
  }

  return row.score;
}

function renderTable(snapshot) {
  const totalLevel = SKILLS.filter(skill => skill !== 'overall')
    .map(s => getLevel(snapshot[s].experience))
    .reduce((acc, cur) => acc + cur);

  const rows = [
    ...SKILLS.map(skill => {
      const { experience, rank } = snapshot[skill];
      const level = skill === 'overall' ? totalLevel : getLevel(experience);
      return { metric: skill, level, experience, rank, ehp: 0 };
    }),
    ...BOSSES.map(boss => {
      const { kills, rank } = snapshot[boss];
      return { metric: boss, kills, rank, ehp: 0 };
    }),
    ...ACTIVITIES.map(activity => {
      const { score, rank } = snapshot[activity];
      return { metric: activity, score, rank, ehp: 0 };
    })
  ];

  const uniqueKeySelector = row => row.metric;

  // Column config
  const columns = [
    {
      key: 'metric',
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
      get: row => row.level || -1,
      transform: val => (val === -1 ? '---' : val)
    },
    {
      key: 'value',
      get: getValue,
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

function GroupStatistics({ statistics, isLoading }) {
  const showPlaceholder = isLoading || !statistics;

  return (
    <div className="group-statistics">
      <div className="statistics-block__container">
        <div className="statistics-block">
          <span className="statistic-label">Maxed overall players</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : statistics.maxedTotalCount}
          </b>
        </div>
        <div className="statistics-block">
          <span className="statistic-label">Maxed combat players</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : statistics.maxedCombatCount}
          </b>
        </div>
        <div className="statistics-block">
          <span className="statistic-label">Number of 200ms</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : statistics.maxed200msCount}
          </b>
        </div>
      </div>
      <div className="statistics-table">
        <span className="widget-label">Average member stats</span>
        {showPlaceholder ? <TablePlaceholder size={20} /> : renderTable(statistics.averageStats)}
      </div>
    </div>
  );
}

GroupStatistics.defaultProps = {
  statistics: undefined
};

GroupStatistics.propTypes = {
  statistics: PropTypes.shape(),
  isLoading: PropTypes.bool.isRequired
};

export default React.memo(GroupStatistics);
