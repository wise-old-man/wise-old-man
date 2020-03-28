import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getPlayerTypeIcon } from '../../utils';
import './PlayerTag.scss';

function getTooltip(type) {
  // Unknown player types happen when tracking fails,
  // so re-tracking should fix it.
  if (type === 'unknown') {
    return `Player type: ${type}. Please re-track this player to update this.`;
  }

  return `Player type: ${type}.`;
}

function PlayerTag({ username, type }) {
  const icon = getPlayerTypeIcon(type);
  const tooltip = useMemo(() => getTooltip(type), [type]);

  return (
    <div className="player-tag">
      {type && (
        <abbr className="player-tag__type" title={tooltip}>
          <img src={icon} alt="" />
        </abbr>
      )}
      <span className="player-tag__username">{username}</span>
    </div>
  );
}

PlayerTag.defaultProps = {
  type: undefined
};

PlayerTag.propTypes = {
  // The player's username
  username: PropTypes.string.isRequired,

  // The player's type
  type: PropTypes.string
};

export default React.memo(PlayerTag);
