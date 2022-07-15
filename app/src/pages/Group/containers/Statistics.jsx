import React, { useEffect, useCallback, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { groupSelectors, groupActions } from 'redux/groups';
import { Table, TablePlaceholder, NumberLabel } from 'components';
import { getMetricIcon, getLevel, getMetricName, formatNumber } from 'utils';
import { SKILLS, BOSSES, ACTIVITIES } from 'config';
import { GroupContext } from '../context';

function Statistics() {
  const dispatch = useDispatch();
  const { context } = useContext(GroupContext);
  const { id } = context;

  const group = useSelector(groupSelectors.getGroup(id));
  const isLoading = useSelector(groupSelectors.isFetchingStatistics);

  const { statistics } = group;
  const showPlaceholder = isLoading || !group || !statistics;

  const fetchGroupStatistics = useCallback(() => {
    if (group && !group.statistics && !isLoading) {
      dispatch(groupActions.fetchStatistics(id));
    }
  }, [dispatch, id, group, isLoading]);

  // Fetch group statistics, on mount
  useEffect(fetchGroupStatistics, [fetchGroupStatistics, isLoading]);

  return (
    <div className="group-statistics">
      <div className="statistics-block__container">
        <div className="statistics-block">
          <span className="statistic-label">Average combat level</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : formatNumber(statistics.averageCombatLevel)}
          </b>
        </div>
        <div className="statistics-block">
          <span className="statistic-label">Maxed overall players</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : statistics.maxedTotalCount}
          </b>
        </div>
        <div className="statistics-block">
          <span className="statistic-label">126 Combat players</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : statistics.maxedCombatCount}
          </b>
        </div>
        <div className="statistics-block">
          <span className="statistic-label">Total 200ms</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : statistics.maxed200msCount}
          </b>
        </div>
        <div className="statistics-block">
          <span className="statistic-label">Players with 200m</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : statistics.playersWithMaxedSkill}
          </b>
        </div>
        <div className="statistics-block">
          <span className="statistic-label">Inferno Cape players</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : formatNumber(statistics.playersWithInferno)}
          </b>
        </div>
        <div className="statistics-block">
          <span className="statistic-label">Average EHP</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : formatNumber(statistics.averageEhpValue)}
          </b>
        </div>
        <div className="statistics-block">
          <span className="statistic-label">Average EHB</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : formatNumber(statistics.averageEhbValue)}
          </b>
        </div>
      </div>
      <div className="statistics-table">
        <span className="widget-label">Member stats</span>
        {showPlaceholder ? <TablePlaceholder size={20} /> : renderTable(statistics.averageStats)}
      </div>
    </div>
  );
}

function getValue(row) {
  if (row.experience !== undefined) return row.experience;
  if (row.kills !== undefined) return row.kills;
  return row.score;
}

function renderTable(snapshot) {
  const totalLevel = SKILLS.filter(skill => skill !== 'overall')
    .map(s => getLevel(snapshot[s].experience))
    .reduce((acc, cur) => acc + cur);

  const rows = [
    ...SKILLS.map(skill => {
      const { experience, rank, total } = snapshot[skill];

      const level = skill === 'overall' ? totalLevel : getLevel(experience);
      const highest = skill === 'overall' ? 0 : getLevel(snapshot[skill].highest);
      return { metric: skill, level, highest, experience, rank, ehp: 0, total };
    }),
    ...BOSSES.map(boss => {
      const { kills, rank, highest, total } = snapshot[boss];
      return { metric: boss, kills, rank, ehp: 0, highest, total };
    }),
    ...ACTIVITIES.map(activity => {
      const { score, rank, highest, total } = snapshot[activity];
      return { metric: activity, score, rank, ehp: 0, highest, total };
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
      key: 'avg Level',
      get: row => row.level || -1,
      transform: val => (val === -1 ? '---' : val)
    },
    {
      key: 'avg value',
      get: getValue,
      transform: val => (val === -1 ? `---` : <NumberLabel value={val} />)
    },
    {
      key: 'highest',
      get: row =>  row.highest || -1,
      transform: val => (val === -1 ? `---` : <NumberLabel value={val} />)
    },
    {
      key: 'total',
      get: row =>  row.total || -1,
      transform: val => (val === -1 ? `---` : <NumberLabel value={val} />)
    }
  ];

  return <Table rows={rows} columns={columns} uniqueKeySelector={uniqueKeySelector} />;
}

export default Statistics;
