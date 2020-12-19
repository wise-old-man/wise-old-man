import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { isSkill, isActivity, isBoss, getMetricIcon } from 'utils';
import { CardList } from 'components';
import { achievementSelectors } from 'redux/achievements';
import { AchievementGroup } from '../components';
import { PlayerContext } from '../context';

function Achievements() {
  const { context } = useContext(PlayerContext);
  const { username, metricType } = context;

  const groupedAchievements = useSelector(state =>
    achievementSelectors.getPlayerAchievementsGrouped(state, username)
  );

  const groups = getFilteredAchievements(groupedAchievements, metricType);

  const nearest = groups
    .map(g => g.achievements)
    .flat()
    .filter(a => a.progress.absolutePercent < 1 && a.measure !== 'levels')
    .sort((a, b) => b.progress.absolutePercent - a.progress.absolutePercent)
    .slice(0, 10);

  const nearestItems = nearest.map(i => ({
    icon: getMetricIcon(i.metric),
    title: i.type,
    subtitle: `${Math.round(i.progress.absolutePercent * 10000) / 100}% completed`
  }));

  return (
    <>
      <div className="player-nearest-achievements__container col-lg-3 col-md-12">
        <span className="panel-label">{`Nearest ${metricType} achievements`}</span>
        <CardList items={nearestItems} emptyMessage="Nothing else to achieve!" />
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
