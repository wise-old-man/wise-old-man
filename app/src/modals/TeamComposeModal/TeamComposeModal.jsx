import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { uniqBy } from 'lodash';
import { ParticipantsSelector, TextInput, Button, TextButton } from 'components';
import { standardize } from 'utils/player';
import ImportPlayersModal from 'modals/ImportPlayersModal';
import './TeamComposeModal.scss';

function TeamComposeModal({ team, onSubmit, onCancel }) {
  const [name, setName] = useState(team ? team.name : '');
  const [players, setPlayers] = useState(team ? team.participants : []);
  const [showingImportModal, toggleImportModal] = useState(false);

  function handleAddPlayer(username) {
    // If multiple names were typed (command-separated)
    if (username.length > 0 && username.split(',').length > 1) {
      handleAddMultiplePlayers(username.split(','));
      return;
    }

    setPlayers(currentPlayers => {
      if (currentPlayers.map(standardize).includes(standardize(username))) {
        return currentPlayers;
      }

      return [...currentPlayers, username];
    });
  }

  function handleRemovePlayer(username) {
    setPlayers(currentPlayers => currentPlayers.filter(p => p !== username));
  }

  function handleAddMultiplePlayers(usernames) {
    const uniqueUsernames = uniqBy(
      usernames.filter(c => c && c.length > 0),
      e => standardize(e)
    );

    setPlayers(currentPlayers => {
      return uniqBy([...currentPlayers, ...uniqueUsernames], e => standardize(e));
    });
  }

  function handleNameChanged(e) {
    setName(e.target.value);
  }

  const handleModalSubmit = (usernames, replace) => {
    if (replace) {
      setPlayers(
        uniqBy(
          usernames.filter(c => c && c.length > 0),
          standardize
        )
      );
    } else {
      handleAddMultiplePlayers(usernames);
    }

    toggleImportModal(false);
  };

  function handleSubmit() {
    onSubmit({ name, participants: players });
  }

  return (
    <>
      <div className="team-compose">
        <div className="team-compose__modal">
          <button className="close-btn" type="button" onClick={onCancel}>
            <img src="/img/icons/clear.svg" alt="X" />
          </button>
          <b className="modal-title">{team ? `Editing team: ${team.name}` : 'Add a new team'}</b>
          <span className="modal-label">Team Name</span>
          <TextInput placeholder="Ex: Warriors" value={name} onChange={handleNameChanged} />
          <br />
          <div className="modal-group">
            <span className="modal-label">{`Participants (${players.length})`}</span>
            <TextButton text="Import player list" onClick={() => toggleImportModal(true)} />
          </div>
          <ParticipantsSelector
            participants={players}
            onParticipantAdded={handleAddPlayer}
            onParticipantRemoved={handleRemovePlayer}
          />
          <br />
          <Button
            text="Confirm"
            onClick={handleSubmit}
            disabled={name.length === 0 || players.length === 0}
          />
        </div>
      </div>
      {showingImportModal && (
        <ImportPlayersModal onClose={() => toggleImportModal(false)} onConfirm={handleModalSubmit} />
      )}
    </>
  );
}

TeamComposeModal.defaultProps = {
  team: undefined
};

TeamComposeModal.propTypes = {
  team: PropTypes.shape({
    name: PropTypes.string,
    participants: PropTypes.arrayOf(PropTypes.string)
  }),
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default TeamComposeModal;
