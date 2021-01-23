import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getPlayerTypeIcon, getPlayerTooltip, getOfficialHiscoresUrl } from 'utils';
import { PageHeader, Dropdown, Button } from 'components';

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
      <PageHeader
        title={player.displayName}
        icon={getPlayerTypeIcon(player.type)}
        iconTooltip={getPlayerTooltip(player.type, player.flagged)}
        badges={getPlayerBadges(player.build)}
      >
        <Button text="Update" onClick={handleUpdate} loading={isTracking} />
        <Dropdown options={MENU_OPTIONS} onSelect={handleOptionSelected}>
          <button className="header__options-btn" type="button">
            <img src="/img/icons/options.svg" alt="" />
          </button>
        </Dropdown>
      </PageHeader>
    </>
  );
}

function FlaggedWarning({ displayName }) {
  const nameChangeURL = `/names/submit/${displayName}`;

  return (
    <div className="warning">
      <img src="/img/runescape/icons_small/flagged.png" alt="" />
      <span>
        This player is flagged. There has been some hiscores rollbacks (December 28th), which makes your
        hiscores stats lower than your wiseoldman stats. This gets flagged as suspicious activity. To fix
        this, we recommend world hopping a few times until the hiscores update.
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

function getPlayerBadges(build) {
  switch (build) {
    case 'lvl3':
      return [{ text: 'Level 3', hoverText: '' }];
    case 'f2p':
      return [{ text: 'F2P', hoverText: '' }];
    case '1def':
      return [{ text: '1 Def Pure', hoverText: '' }];
    case '10hp':
      return [{ text: '10 HP Pure', hoverText: '' }];
    default:
      return [];
  }
}

Header.propTypes = {
  player: PropTypes.shape({
    username: PropTypes.string,
    displayName: PropTypes.string,
    flagged: PropTypes.bool,
    type: PropTypes.string,
    build: PropTypes.string
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
