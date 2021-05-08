import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getPlayerTypeIcon, getPlayerTooltip, getOfficialHiscoresUrl } from 'utils';
import { PageHeader, Dropdown, Button, Badge } from 'components';

const MENU_OPTIONS = [
  { label: 'Open official hiscores', value: 'OPEN_HISCORES' },
  { label: 'Reset username capitalization', value: 'ASSERT_NAME' },
  { label: 'Reassign player type', value: 'ASSERT_TYPE' },
  { label: 'Change name', value: 'CHANGE_NAME' }
];

function Header(props) {
  const { player, isTracking, handleUpdate, handleRedirect, handleAssertName, handleAssertType } = props;

  const handleOptionSelected = option => {
    if (option.value === 'OPEN_HISCORES') {
      handleRedirect(getOfficialHiscoresUrl(player));
    } else if (option.value === 'CHANGE_NAME') {
      handleRedirect(`/names/submit/${player.displayName}`);
    } else if (option.value === 'ASSERT_NAME') {
      handleAssertName();
    } else if (option.value === 'ASSERT_TYPE') {
      handleAssertType();
    }
  };

  return (
    <>
      {player.flagged && <FlaggedWarning displayName={player.displayName} />}
      {!player.flagged && player.type === 'hardcore' && <RollbackWarning />}
      <PageHeader
        title={player.displayName}
        icon={getPlayerTypeIcon(player.type)}
        iconTooltip={getPlayerTooltip(player.type, player.flagged)}
        renderLeft={() => {
          const buildBadge = getBuildBadge(player.build);
          return (
            <>
              {buildBadge && <Badge text={buildBadge.text} hoverText={buildBadge.hoverText} />}
              {player.country && (
                <abbr
                  className="flag"
                  title={`Country: ${player.country}. Set your own flag at wiseoldman.net/flags`}
                >
                  <img src={`/img/flags/${player.country}.svg`} alt={player.country} />
                </abbr>
              )}
            </>
          );
        }}
        renderRight={() => (
          <>
            <Button text="Update" onClick={handleUpdate} loading={isTracking} />
            <Dropdown options={MENU_OPTIONS} onSelect={handleOptionSelected}>
              <button className="header__options-btn" type="button">
                <img src="/img/icons/options.svg" alt="" />
              </button>
            </Dropdown>
          </>
        )}
      />
    </>
  );
}

function RollbackWarning() {
  return (
    <div className="warning">
      <span>
        There have been some HCIM hiscores rollbacks (May 6th &amp; 7th). This may cause your hiscores
        stats to be lower than your WiseOldMan stats, and possibily get your account flagged for
        suspicious activity.
        <b> &nbsp; To fix this, we recommend world hopping a few times until the hiscores update.</b>
        <br />
        <br />
        If you need further assistance, please join our &nbsp;
        <a href="https://wiseoldman.net/discord" target="_blank" rel="noopener noreferrer">
          Discord server
        </a>
      </span>
    </div>
  );
}

function FlaggedWarning({ displayName }) {
  const nameChangeURL = `/names/submit/${displayName}`;

  return (
    <div className="warning">
      <img src="/img/runescape/icons_small/flagged.png" alt="" />
      <span>
        This player is flagged. There have been some hiscores rollbacks (May 6th &amp; 7th), which makes
        your hiscores stats lower than your wiseoldman stats. This gets flagged as suspicious activity.
        To fix this, we recommend world hopping a few times until the hiscores update.
        <br />
        <br />
        Alternatively, this can be caused by an unregistered name change or they have become unranked in
        one or more skills due to lack of progress.
        <br />
        <br />
        <Link to={nameChangeURL}>Click here to submit a name change</Link>
        &nbsp; or join our &nbsp;
        <a href="https://wiseoldman.net/discord" target="_blank" rel="noopener noreferrer">
          Discord server
        </a>
        &nbsp; for help.
      </span>
    </div>
  );
}

function getBuildBadge(build) {
  switch (build) {
    case 'lvl3':
      return { text: 'Level 3', hoverText: '' };
    case 'f2p':
      return { text: 'F2P', hoverText: '' };
    case '1def':
      return { text: '1 Def Pure', hoverText: '' };
    case '10hp':
      return { text: '10 HP Pure', hoverText: '' };
    default:
      return null;
  }
}

Header.propTypes = {
  player: PropTypes.shape({
    username: PropTypes.string,
    displayName: PropTypes.string,
    flagged: PropTypes.bool,
    type: PropTypes.string,
    build: PropTypes.string,
    country: PropTypes.string
  }).isRequired,
  isTracking: PropTypes.bool.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleRedirect: PropTypes.func.isRequired,
  handleAssertName: PropTypes.func.isRequired,
  handleAssertType: PropTypes.func.isRequired
};

FlaggedWarning.propTypes = {
  displayName: PropTypes.string.isRequired
};

export default Header;
