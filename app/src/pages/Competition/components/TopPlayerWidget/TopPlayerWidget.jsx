import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatNumber } from '../../../../utils';
import './TopPlayerWidget.scss';

function TopPlayerWidget({ competition }) {
  const { participants } = competition;
  const showPlaceholder = !competition || !participants || !participants.length;

  if (showPlaceholder) {
    return (
      <div className="top-player-widget">
        <b className="top__username -placeholder" />
        <span className="top__gained -placeholder" />
      </div>
    );
  }

  const topPlayer = competition.participants[0];
  const gained = formatNumber(topPlayer && topPlayer.progress ? topPlayer.progress.delta : 0);

  return (
    <Link className="top-player-widget -clickable" to={`/players/${topPlayer.id}`}>
      <b className="top__username">{topPlayer.username}</b>
      <span className="top__gained">{`${gained} exp gained`}</span>
    </Link>
  );
}

TopPlayerWidget.propTypes = {
  competition: PropTypes.shape().isRequired
};

export default TopPlayerWidget;
