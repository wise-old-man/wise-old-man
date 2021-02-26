import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getMetricIcon, getMetricName, formatDate, formatNumber, getLevel } from 'utils';
import './AchievementGroup.scss';

function AchievementGroup({ group, metricType }) {
  const { metric, achievements } = group;

  return (
    <div className="achievement-group">
      <div className="group-icon">
        <img src={getMetricIcon(metric)} alt="" />
      </div>
      <b className={`group-title -${metricType}`}>{getGroupTitle(group)}</b>
      <div className="group-progress">
        <AchievementOrb achievement={null} />
        {achievements.map(achievement => (
          <Fragment key={achievement.name}>
            <ProgressBar achievement={achievement} equalSizes={isEqualSizes(achievements)} />
            <AchievementOrb achievement={achievement} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ achievement, equalSizes }) {
  const { relativeProgress, currentValue, threshold } = achievement;

  const className = classNames('achievement-progress', {
    '-full': equalSizes || (relativeProgress > 0 && relativeProgress < 1)
  });

  const progressInt = Math.floor(relativeProgress * 100);
  const current = formatNumber(currentValue, true);
  const goal = formatNumber(threshold, true);

  return (
    <abbr className={className} title={`${current} / ${goal}\n(${progressInt}% to next tier)`}>
      <div className="achievement-progress__fill" style={{ width: `${progressInt}%` }} />
    </abbr>
  );
}

function AchievementOrb({ achievement }) {
  if (!achievement) {
    return <div className="achievement-orb -zero">0</div>;
  }

  const { createdAt, absoluteProgress, name, threshold, unknownDate } = achievement;

  const formattedThreshold = formatThreshold(threshold);
  const className = classNames('achievement-orb', { '-completed': absoluteProgress === 1 });

  const info =
    absoluteProgress === 1
      ? `${name} - ${unknownDate ? 'Unknown date ' : formatDate(createdAt)}`
      : `${name} - Unachieved`;

  return (
    <abbr className={className} title={info}>
      {formattedThreshold}
    </abbr>
  );
}

function isEqualSizes(achievements) {
  // If someone has just reached a threshold (ex: 1k zulrah kills), their 1k zulrah
  // achiev will be at relativeProgress:1 but their 5k zulrah will be at relativeProgress:0
  // because that progress is rounded after a few decimal cases.
  // To prevent this, we should just check if there's any "started" tier, even if at 0% progress
  const hasStartedTier = achievements.some((a, i) => {
    if (i === 0) return false;
    return a.relativeProgress === 0 && achievements[i - 1].relativeProgress === 1;
  });

  return (
    achievements.length === 1 ||
    hasStartedTier ||
    achievements.filter(g => g.relativeProgress === 1).length === achievements.length ||
    achievements.filter(g => g.relativeProgress === 0).length === achievements.length
  );
}

function formatThreshold(threshold) {
  if (threshold < 1000) {
    return threshold;
  }

  if ([273742, 737627, 1986068, 5346332, 13034431].includes(threshold)) {
    return getLevel(threshold + 100).toString();
  }

  if (threshold <= 10000) {
    return `${threshold / 1000}k`;
  }

  if (threshold === 13034431) {
    return '99';
  }

  return formatNumber(threshold, true);
}

function getGroupTitle(group) {
  if (group.metric === 'overall') {
    return group.measure === 'levels' ? 'Base Stats' : 'Overall Exp.';
  }

  return group.achievements.length > 1 ? getMetricName(group.metric) : group.achievements[0].name;
}

AchievementGroup.propTypes = {
  metricType: PropTypes.string.isRequired,
  group: PropTypes.shape({
    measure: PropTypes.string,
    metric: PropTypes.string,
    achievements: PropTypes.arrayOf(PropTypes.shape())
  }).isRequired
};

ProgressBar.defaultProps = {
  achievement: undefined,
  equalSizes: false
};

ProgressBar.propTypes = {
  achievement: PropTypes.shape({
    relativeProgress: PropTypes.number,
    currentValue: PropTypes.number,
    threshold: PropTypes.number
  }),
  equalSizes: PropTypes.bool
};

AchievementOrb.defaultProps = {
  achievement: undefined
};

AchievementOrb.propTypes = {
  achievement: PropTypes.shape()
};

export default AchievementGroup;
