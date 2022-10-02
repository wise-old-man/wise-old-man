import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import className from 'classnames';
import { formatNumber, isSkill, isBoss, isActivity } from 'utils';
import './TopParticipant.scss';

function measureLabel(metric) {
  if (isSkill(metric)) return 'exp gained';
  if (isBoss(metric)) return 'kills';
  if (isActivity(metric)) return 'gained';
  return metric.toUpperCase();
}

function TopParticipant({ participations, metric }) {
  const showPlaceholder = !participations || !participations.length;

  if (showPlaceholder) {
    return (
      <div className="top-participant-widget">
        <b className="top__name -placeholder" />
        <span className="top__gained -placeholder" />
      </div>
    );
  }

  const topPlayer = participations[0];

  const gained = topPlayer && topPlayer.progress ? topPlayer.progress.gained : 0;
  const label = `${gained === 0 ? '' : '+'}${formatNumber(gained)} ${measureLabel(metric)}`;

  return (
    <Link className="top-participant-widget -clickable" to={`/players/${topPlayer.player.username}`}>
      <b className="top__name">{topPlayer.player.displayName}</b>
      <span className={className('top__gained', { '-green': gained > 0 })}>{label}</span>
    </Link>
  );
}
TopParticipant.defaultProps = {
  participations: []
};

TopParticipant.propTypes = {
  metric: PropTypes.string.isRequired,
  participations: PropTypes.arrayOf(
    PropTypes.shape({
      player: PropTypes.shape({
        username: PropTypes.string,
        displayName: PropTypes.string
      }),
      progress: PropTypes.shape({
        gained: PropTypes.number,
        start: PropTypes.number,
        end: PropTypes.number
      })
    })
  )
};

export default TopParticipant;
