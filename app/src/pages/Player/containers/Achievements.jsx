import React, { useContext, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { isSkill, isActivity, isBoss, getMetricIcon, formatDate } from 'utils';
import { SKILLS, BOSSES, ACTIVITIES } from 'config';
import { CardList, Selector, Loading } from 'components';
import { achievementSelectors, achievementActions } from 'redux/achievements';
import { AchievementGroup } from '../components';
import { PlayerContext } from '../context';

const METRIC_TYPE_OPTIONS = [
  { label: 'Skilling', value: 'skilling' },
  { label: 'Bossing', value: 'bossing' },
  { label: 'Activities', value: 'activities' }
];

function Achievements() {
  const dispatch = useDispatch();
  const { context, updateContext } = useContext(PlayerContext);

  const { username, metricType } = context;
  const metricTypeIndex = METRIC_TYPE_OPTIONS.findIndex(o => o.value === metricType);

  const isLoading = useSelector(achievementSelectors.isFetchingPlayerAchievements);
  const groupedAchievements = useSelector(achievementSelectors.getPlayerAchievementsGrouped(username));
  const allAchievements = useSelector(achievementSelectors.getPlayerAchievements(username, true));
  const completedAchievements = useSelector(achievementSelectors.getPlayerAchievements(username));

  const handleMetricTypeSelected = e => {
    if (e.value === 'skilling') {
      updateContext({ metricType: e.value, metric: SKILLS[0] });
    } else if (e.value === 'bossing') {
      updateContext({ metricType: e.value, metric: BOSSES[0] });
    } else if (e.value === 'activities') {
      updateContext({ metricType: e.value, metric: ACTIVITIES[0] });
    }
  };

  const fetchAchievements = useCallback(() => {
    // Fetch player achievements, if not loaded yet
    if (!allAchievements) {
      dispatch(achievementActions.fetchPlayerAchievements(username));
    }
  }, [dispatch, username, allAchievements]);

  useEffect(fetchAchievements, [fetchAchievements]);

  if (isLoading) {
    return <Loading />;
  }

  if (!groupedAchievements || !completedAchievements || !allAchievements) {
    return null;
  }

  const groups = groupedAchievements.filter(a => isOfMetricType(a, metricType));

  const nearestItems = allAchievements
    .filter(a => isOfMetricType(a, metricType) && a.absoluteProgress < 1)
    .sort((a, b) => b.absoluteProgress - a.absoluteProgress)
    .slice(0, 20)
    .map(i => ({
      icon: getMetricIcon(i.metric),
      title: i.name,
      subtitle: `${Math.round(i.absoluteProgress * 10000) / 100}% completed`
    }));

  const latestItems = completedAchievements
    .filter(a => isOfMetricType(a, metricType))
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
        {latestItems && latestItems.length > 0 && (
          <>
            <span className="panel-label">Latest achievements</span>
            <CardList items={latestItems} />
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

function isOfMetricType(achievement, metricType) {
  if (metricType === 'skilling') return isSkill(achievement.metric) || achievement.metric === 'combat';
  if (metricType === 'activities') return isActivity(achievement.metric);
  return isBoss(achievement.metric) || achievement.metric === 'bossing';
}

export default Achievements;
