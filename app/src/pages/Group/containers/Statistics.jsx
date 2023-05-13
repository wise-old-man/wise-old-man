import React, { useEffect, useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { SKILLS, BOSSES, ACTIVITIES, MetricProps, getLevel } from '@wise-old-man/utils';
import { groupSelectors, groupActions } from 'redux/groups';
import { Table, TablePlaceholder, NumberLabel, Tabs } from 'components';
import { getMetricIcon } from 'utils';
import { GroupContext } from '../context';

const TABS = ['Average member stats', 'Metric leaders'];

function Statistics() {
  const dispatch = useDispatch();
  const { context } = useContext(GroupContext);
  const { id } = context;

  const group = useSelector(groupSelectors.getGroup(id));
  const isLoading = useSelector(groupSelectors.isFetchingStatistics);
  const [selectedStatsTab, setSelectedStatsTab] = useState(0);

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
          <span className="statistic-label">Number of 200ms</span>
          <b className="statistic-value">
            {showPlaceholder ? 'Loading...' : statistics.maxed200msCount}
          </b>
        </div>
      </div>
      <div className="statistics-table">
        <Tabs tabs={TABS} selectedIndex={selectedStatsTab} onTabSelected={setSelectedStatsTab} />
        {showPlaceholder ? (
          <TablePlaceholder size={20} />
        ) : (
          renderStatsTable(statistics, selectedStatsTab)
        )}
      </div>
    </div>
  );
}

function getValue(row) {
  if (row.experience !== undefined) return row.experience;
  if (row.kills !== undefined) return row.kills;
  return row.score;
}

function renderStatsTable(stats, selectedStatsTab) {
  const isMetricLeaders = selectedStatsTab === 1;
  let data;

  if (isMetricLeaders) {
    data = stats.metricLeaders;
  } else {
    data = stats.averageStats.data;
  }

  const totalLevel = SKILLS.filter(skill => skill !== 'overall')
    .map(s => getLevel(data.skills[s].experience))
    .reduce((acc, cur) => acc + cur);

  const rows = [
    ...SKILLS.map(skill => {
      const { experience, rank, player } = data.skills[skill];
      const level = skill === 'overall' ? totalLevel : getLevel(experience);
      return {
        metric: skill,
        level,
        experience,
        rank,
        ehp: 0,
        username: player ? player.displayName : null
      };
    }),
    ...BOSSES.map(boss => {
      const { kills, rank, player } = data.bosses[boss];
      return {
        metric: boss,
        kills,
        rank,
        ehp: 0,
        username: player ? player.displayName : null
      };
    }),
    ...ACTIVITIES.map(activity => {
      const { score, rank, player } = data.activities[activity];
      return {
        metric: activity,
        score,
        rank,
        ehp: 0,
        username: player ? player.displayName : null
      };
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
          <span>{MetricProps[value].name}</span>
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
      transform: val => (val === -1 ? `---` : <NumberLabel value={val} />)
    }
  ];

  if (isMetricLeaders) {
    // Add the players username for metric leaders
    columns.splice(1, 0, {
      key: 'username',
      transform: val => (val ? <Link to={`/players/${val}`}>{val}</Link> : '---')
    });

    // Add the rank for individual stats (excluded for the average)
    columns.push({
      key: 'rank',
      transform: val => (val === -1 ? `---` : <NumberLabel value={val} />)
    });
  }

  return <Table rows={rows} columns={columns} uniqueKeySelector={uniqueKeySelector} />;
}

export default Statistics;
