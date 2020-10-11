import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import className from 'classnames';
import { formatNumber, isSkill, isBoss, isActivity } from '../../../../utils';
import './TopPlayerWidget.scss';

function measureLabel(metric) {
  if (isSkill(metric)) return 'exp gained';
  if (isBoss(metric)) return 'kills';
  if (isActivity(metric)) return 'gained';
  return metric.toUpperCase();
}

function TopPlayerWidget({ competition }) {
  const { participants, metric } = competition;
  const showPlaceholder = !competition || !participants || !participants.length;

  if (showPlaceholder) {
    return (
      <div className="top-participant-widget">
        <b className="top__name -placeholder" />
        <span className="top__gained -placeholder" />
      </div>
    );
  }

  const topPlayer = participants[0];
  const gained = topPlayer && topPlayer.progress ? topPlayer.progress.gained : 0;
  const label = `+${formatNumber(gained)} ${measureLabel(metric)}`;

  return (
    <Link className="top-participant-widget -clickable" to={`/players/${topPlayer.id}`}>
      <b className="top__name">{topPlayer.displayName}</b>
      <span className={className('top__gained', { '-green': gained > 0 })}>{label}</span>
    </Link>
  );
}

TopPlayerWidget.propTypes = {
  competition: PropTypes.shape().isRequired
};

export default TopPlayerWidget;
