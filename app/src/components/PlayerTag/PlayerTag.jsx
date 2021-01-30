import React from 'react';
import PropTypes from 'prop-types';
import { getPlayerTypeIcon, getPlayerTooltip } from 'utils';
import './PlayerTag.scss';

const FLAGGED_ICON = '/img/runescape/icons_small/flagged.png';

function PlayerTag({ name, type, country, flagged }) {
  const icon = flagged ? FLAGGED_ICON : getPlayerTypeIcon(type);
  const tooltip = getPlayerTooltip(type, flagged);

  return (
    <div className="player-tag">
      <div className="left">
        {(type || flagged) && (
          <abbr className="player-tag__type" title={tooltip}>
            <img src={icon} alt="" />
          </abbr>
        )}
        <span className="player-tag__name">{name}</span>
      </div>
      {country && (
        <abbr
          className="player-tag__flag"
          title={`Country: ${country}. Set your own flag at wiseoldman.net/flags`}
        >
          <img src={`/img/flags/${country}.svg`} alt={country} />
        </abbr>
      )}
    </div>
  );
}

PlayerTag.defaultProps = {
  type: undefined,
  country: undefined,
  flagged: false
};

PlayerTag.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  country: PropTypes.string,
  flagged: PropTypes.bool
};

export default React.memo(PlayerTag);
