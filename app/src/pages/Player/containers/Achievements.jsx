import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { isSkill, isActivity, isBoss, getMetricIcon, formatDate } from 'utils';
import { SKILLS, BOSSES, ACTIVITIES } from 'config';
import { CardList, Selector } from 'components';
import { achievementSelectors } from 'redux/achievements';
import { AchievementGroup } from '../components';
import { PlayerContext } from '../context';

const METRIC_TYPE_OPTIONS = [
  { label: 'Skilling', value: 'skilling' },
  { label: 'Bossing', value: 'bossing' },
  { label: 'Activities', value: 'activities' }
];

function Achievements() {
  const { context, updateContext } = useContext(PlayerContext);
  const { username, metricType } = context;

  const groupedAchievements = useSelector(state =>
    achievementSelectors.getPlayerAchievementsGrouped(state, username)
  );

  const allAchievements = useSelector(state =>
    achievementSelectors.getPlayerAchievements(state, username, true)
  );

  const completedAchievements = useSelector(state =>
    achievementSelectors.getPlayerAchievements(state, username)
  );

  const groups = getFilteredAchievements(groupedAchievements, metricType);

  const metricTypeIndex = METRIC_TYPE_OPTIONS.findIndex(o => o.value === metricType);

  function handleMetricTypeSelected(e) {
    if (e.value === 'skilling') {
      updateContext({ metricType: e.value, metric: SKILLS[0] });
    } else if (e.value === 'bossing') {
      updateContext({ metricType: e.value, metric: BOSSES[0] });
    } else if (e.value === 'activities') {
      updateContext({ metricType: e.value, metric: ACTIVITIES[0] });
    }
  }

  if (!groupedAchievements || !completedAchievements || !allAchievements) {
    return null;
  }

  const nearestItems = allAchievements
    .filter(a => a.absoluteProgress < 1)
    .sort((a, b) => b.absoluteProgress - a.absoluteProgress)
    .slice(0, 20)
    .map(i => ({
      icon: getMetricIcon(i.metric),
      title: i.name,
      subtitle: `${Math.round(i.absoluteProgress * 10000) / 100}% completed`
    }));

  const recentItems = completedAchievements
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 20)
    .map(a => ({
      icon: getMetricIcon(a.metric),
      title: a.name,
      subtitle: a.unknownDate ? 'Unknown date' : formatDate(a.createdAt, 'DD MMM, YYYY')
    }));

  return (
    <>
      <div className="row achievements-controls">
        <div className="col-lg-3 col-sm-12">
          <Selector
            options={METRIC_TYPE_OPTIONS}
            selectedIndex={metricTypeIndex}
            onSelect={handleMetricTypeSelected}
          />
        </div>
      </div>
      <div className="player-nearest-achievements__container col-lg-3 col-md-12">
        {recentItems && recentItems.length > 0 && (
          <>
            <span className="panel-label">Recent achievements</span>
            <CardList items={recentItems} />
          </>
        )}
        {nearestItems && nearestItems.length > 0 && (
          <>
            <span className="panel-label">{`Nearest ${metricType} achievements`}</span>
            <CardList items={nearestItems} />
          </>
        )}
      </div>
      <div className="player-achievements__container col-lg-9 col-md-12">
        {groups.map(group => (
          <AchievementGroup
            key={`${group.metric}|${group.measure}|${group.achievements.length}`}
            group={group}
            metricType={metricType}
          />
        ))}
      </div>
    </>
  );
}

function getFilteredAchievements(groups, metricType) {
  if (!groups) {
    return [];
  }

  if (metricType === 'skilling') {
    return groups.filter(r => isSkill(r.metric) || r.metric === 'combat');
  }

  if (metricType === 'activities') {
    return groups.filter(r => isActivity(r.metric));
  }

  return groups.filter(r => isBoss(r.metric) || r.metric === 'bossing');
}

export default Achievements;
