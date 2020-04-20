import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatNumber } from '../../../../utils';
import './TopPlayerWidget.scss';

function TopPlayerWidget({ group }) {
  if (!group || group.monthlyTopPlayer === undefined) {
    return (
      <div className="top-player-widget">
        <b className="top__username -placeholder" />
        <span className="top__gained -placeholder" />
      </div>
    );
  }

  const topPlayer = group.monthlyTopPlayer;
  const gained = formatNumber(topPlayer && topPlayer.gained ? topPlayer.gained : 0);

  return (
    <Link className="top-player-widget -clickable" to={`/players/${topPlayer.playerId}`}>
      <b className="top__username">{topPlayer.username}</b>
      <span className="top__gained">{`${gained} exp gained`}</span>
    </Link>
  );
}

TopPlayerWidget.propTypes = {
  group: PropTypes.shape().isRequired
};

export default TopPlayerWidget;
