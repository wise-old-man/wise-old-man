import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getMetricIcon, getMetricName, formatDate, formatNumber } from 'utils';
import { CAPPED_MAX_TOTAL_XP } from 'config';
import './AchievementGroup.scss';

function AchievementGroup({ group, metricType }) {
  const { metric, achievements } = group;

  return (
    <div className="achievement-group">
      <div className="group-icon">
        <img src={getMetricIcon(metric)} alt="" />
      </div>
      <b className={`group-title -${metricType}`}>
        {achievements.length > 1 ? getMetricName(metric) : achievements[0].type}
      </b>
      <div className="group-progress">
        <AchievementOrb achievement={null} />
        {achievements.map(achievement => (
          <Fragment key={achievement.type}>
            <ProgressBar
              progress={achievement.progress.percentToNextTier}
              equalSizes={isEqualSizes(achievements)}
            />
            <AchievementOrb achievement={achievement} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ progress, equalSizes }) {
  const className = classNames('achievement-progress', {
    '-full': equalSizes || (progress >= 0 && progress < 1)
  });

  const progressInt = Math.floor(progress * 100);

  return (
    <abbr className={className} title={`${progressInt} %`}>
      <div className="achievement-progress__fill" style={{ width: `${progressInt}%` }} />
    </abbr>
  );
}

function AchievementOrb({ achievement }) {
  if (!achievement) {
    return <div className="achievement-orb -zero">0</div>;
  }

  const { createdAt, progress, type, threshold, unknownDate } = achievement;

  const isAchieved = progress.absolutePercent === 1;

  const formattedThreshold = formatThreshold(threshold);
  const className = classNames('achievement-orb', { '-completed': isAchieved });

  const info = isAchieved
    ? `${type} - ${unknownDate ? 'Unknown date ' : formatDate(createdAt)}`
    : `${type} - Unachieved`;

  return (
    <abbr className={className} title={info}>
      {formattedThreshold}
    </abbr>
  );
}

function isEqualSizes(achievements) {
  return (
    achievements.length === 1 ||
    achievements.filter(g => g.progress.percentToNextTier === 1).length === achievements.length ||
    achievements.filter(g => g.progress.percentToNextTier === 0).length === achievements.length
  );
}

function formatThreshold(threshold) {
  if (threshold < 1000 || threshold === 2277) {
    return threshold;
  }

  if (threshold <= 10000) {
    return `${threshold / 1000}k`;
  }

  if (threshold === 13034431) {
    return '99';
  }

  if (threshold === CAPPED_MAX_TOTAL_XP) {
    return '2277';
  }

  return formatNumber(threshold, true);
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

export default AchievementGroup;
