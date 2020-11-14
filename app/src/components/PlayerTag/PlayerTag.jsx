import React from 'react';
import PropTypes from 'prop-types';
import { getPlayerIcon, getPlayerTooltip } from 'utils';
import './PlayerTag.scss';

function PlayerTag({ name, type, flagged }) {
  const icon = getPlayerIcon(type, flagged);
  const tooltip = getPlayerTooltip(type, flagged);

  return (
    <div className="player-tag">
      {(type || flagged) && (
        <abbr className="player-tag__type" title={tooltip}>
          <img src={icon} alt="" />
        </abbr>
      )}
      <span className="player-tag__name">{name}</span>
    </div>
  );
}

PlayerTag.defaultProps = {
  type: undefined,
  flagged: false
};

PlayerTag.propTypes = {
  // The player's name
  name: PropTypes.string.isRequired,

  // The player's type
  type: PropTypes.string,

  flagged: PropTypes.bool
};

export default React.memo(PlayerTag);
