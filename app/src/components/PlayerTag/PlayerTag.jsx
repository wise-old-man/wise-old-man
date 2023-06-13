import React from 'react';
import PropTypes from 'prop-types';
import { getPlayerTypeIcon, getPlayerTooltip } from 'utils';
import './PlayerTag.scss';

const FLAGGED_ICON = '/img/runescape/icons_small/flagged.png';
const UNRANKED_ICON = '/img/runescape/icons_small/unranked.png';
const ARCHIVED_ICON = '/img/runescape/icons_small/archived.png';

function PlayerTag({ name, type, country, status }) {
  let icon;

  if (status === 'archived') {
    icon = ARCHIVED_ICON;
  } else if (status === 'flagged') {
    icon = FLAGGED_ICON;
  } else if (status === 'unranked' || status === 'banned') {
    icon = UNRANKED_ICON;
  } else {
    icon = getPlayerTypeIcon(type);
  }

  const tooltip = getPlayerTooltip(type, status);

  return (
    <div className="player-tag">
      <div className="left">
        <abbr className="player-tag__type" title={tooltip}>
          <img src={icon} alt="" />
        </abbr>
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
  status: undefined
};

PlayerTag.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  country: PropTypes.string,
  status: PropTypes.string
};

export default React.memo(PlayerTag);
