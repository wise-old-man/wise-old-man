import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getPlayerTypeIcon, getPlayerTooltip } from '../../utils';
import './PlayerTag.scss';

function PlayerTag({ name, type }) {
  const icon = getPlayerTypeIcon(type);
  const tooltip = useMemo(() => getPlayerTooltip(type), [type]);

  return (
    <div className="player-tag">
      {type && (
        <abbr className="player-tag__type" title={tooltip}>
          <img src={icon} alt="" />
        </abbr>
      )}
      <span className="player-tag__name">{name}</span>
    </div>
  );
}

PlayerTag.defaultProps = {
  type: undefined
};

PlayerTag.propTypes = {
  // The player's name
  name: PropTypes.string.isRequired,

  // The player's type
  type: PropTypes.string
};

export default React.memo(PlayerTag);
