import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatNumber, isSkill, getMeasure } from '../../../../utils';
import './TopPlayerWidget.scss';

function TopPlayerWidget({ competition }) {
  const { participants, metric } = competition;
  const showPlaceholder = !competition || !participants || !participants.length;

  if (showPlaceholder) {
    return (
      <div className="top-player-widget">
        <b className="top__username -placeholder" />
        <span className="top__gained -placeholder" />
      </div>
    );
  }

  const topPlayer = participants[0];
  const gained = formatNumber(topPlayer && topPlayer.progress ? topPlayer.progress.delta : 0);

  const gainedLabel = isSkill(metric) ? 'exp gained' : getMeasure(metric);

  return (
    <Link className="top-player-widget -clickable" to={`/players/${topPlayer.id}`}>
      <b className="top__username">{topPlayer.username}</b>
      <span className="top__gained">{`${gained} ${gainedLabel}`}</span>
    </Link>
  );
}

TopPlayerWidget.propTypes = {
  competition: PropTypes.shape().isRequired
};

export default TopPlayerWidget;
