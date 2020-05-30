import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  isSkill,
  isActivity,
  isBoss,
  getMetricIcon,
  getMetricName,
  formatDate,
  getTotalLevel
} from '../../../../utils';
import './PlayerAchievements.scss';

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

function formatValue(value) {
  if (value < 1000000) {
    return value;
  }

  if (value === 13034431) {
    return '99';
  }

  if (value < 1000000000) {
    return `${value / 1000000}m`;
  }

  return `${value / 1000000000}b`;
}

function attachProgress(player, group) {
  if (!player) {
    return group;
  }

  const { latestSnapshot } = player;

  if (group.metric === 'combat') {
    const progress = player.combatLevel / 126;
    return { ...group, achievements: [...group.achievements.map(a => ({ ...a, progress }))] };
  }

  if (group.metric === 'overall' && group.measure === 'levels') {
    const progress = getTotalLevel(latestSnapshot) / 2277;
    return { ...group, achievements: [...group.achievements.map(a => ({ ...a, progress }))] };
  }

  if (latestSnapshot[group.metric]) {
    const currentValue = latestSnapshot[group.metric][group.measure];

    const processedAchievements = group.achievements.map((achievement, i) => {
      if (currentValue >= achievement.value) {
        return { ...achievement, progress: 1 };
      }

      const prevStart = i === 0 ? 0 : group.achievements[i - 1].value;
      const currentProgress = Math.max(0, (currentValue - prevStart) / (achievement.value - prevStart));

      return { ...achievement, progress: currentProgress };
    });

    return { ...group, achievements: processedAchievements };
  }

  return group;
}

function processGroups(player, groups, metricType) {
  if (!player || !groups || !metricType) {
    return [];
  }

  return getFilteredAchievements(
    groups
      .map(group => attachProgress(player, group))
      .sort((a, b) => a.achievements.length - b.achievements.length),
    metricType
  );
}

function AchievementOrb({ achievement }) {
  if (!achievement) {
    return <div className="achievement-orb -zero">0</div>;
  }

  const { createdAt, progress, type, value, unknownDate } = achievement;

  const isCompleted = progress === 1;

  const formattedValue = formatValue(value);
  const className = classNames('achievement-orb', { '-completed': isCompleted });
  const info = `${type} - ${unknownDate ? 'Unknown date ' : formatDate(createdAt)}`;

  return (
    <abbr className={className} title={info}>
      {formattedValue}
    </abbr>
  );
}

function ProgressBar({ progress, equalSizes }) {
  const className = classNames('achievement-progress', {
    '-full': equalSizes || (progress > 0 && progress < 1)
  });

  return (
    <div className={className}>
      <div className="achievement-progress__fill" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}

function PlayerAchievements({ player, groupedAchievements, metricType }) {
  const groups = useMemo(() => processGroups(player, groupedAchievements, metricType), [
    player,
    groupedAchievements,
    metricType
  ]);

  const equalSizes = achievements =>
    achievements.length === 1 ||
    achievements.filter(g => g.progress === 1).length === achievements.length;

  return (
    <div className="player-achievements__container">
      {groups.map(({ metric, measure, achievements }) => (
        <div key={`${metric}|${measure}`} className="achievement-group">
          <div className="group-icon">
            <img src={getMetricIcon(metric)} alt="" />
          </div>
          <b className="group-title">
            {achievements.length > 1 ? getMetricName(metric) : achievements[0].type}
          </b>
          <div className="group-progress">
            <AchievementOrb achievement={null} />
            {achievements.map(achievement => (
              <Fragment key={achievement.type}>
                <ProgressBar progress={achievement.progress} equalSizes={equalSizes(achievements)} />
                <AchievementOrb achievement={achievement} />
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

ProgressBar.defaultProps = {
  progress: undefined,
  equalSizes: false
};

ProgressBar.propTypes = {
  progress: PropTypes.number,
  equalSizes: PropTypes.bool
};

AchievementOrb.defaultProps = {
  achievement: undefined
};

AchievementOrb.propTypes = {
  achievement: PropTypes.shape()
};

PlayerAchievements.defaultProps = {
  groupedAchievements: [],
  player: undefined
};

PlayerAchievements.propTypes = {
  player: PropTypes.shape(),
  groupedAchievements: PropTypes.arrayOf(PropTypes.arrayOf),
  metricType: PropTypes.string.isRequired
};

export default PlayerAchievements;
