import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatNumber } from 'utils';
import './TopPlayerWidget.scss';

function TopPlayerWidget({ group, isLoading }) {
  if (!group || isLoading) {
    return (
      <div className="top-player-widget">
        <b className="top__name -placeholder" />
        <span className="top__gained -placeholder" />
      </div>
    );
  }

  const topPlayer = group.monthlyTopPlayer;

  if (!topPlayer) {
    return (
      <div className="top-player-widget">
        <b className="top__name">---</b>
        <span className="top__gained">0 exp gained</span>
      </div>
    );
  }

  const { player, data } = topPlayer;

  return (
    <Link className="top-player-widget -clickable" to={`/players/${player.username}`}>
      <b className="top__name">{player.displayName}</b>
      <span className="top__gained">{`${formatNumber(data.gained || 0)} exp gained`}</span>
    </Link>
  );
}

TopPlayerWidget.propTypes = {
  group: PropTypes.shape().isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default TopPlayerWidget;
