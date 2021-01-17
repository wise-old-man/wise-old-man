import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ParticipantsSelector, TextInput, Button } from 'components';
import { standardize } from 'utils/player';
import './TeamComposeModal.scss';

function TeamComposeModal({ team, onSubmit, onCancel }) {
  const [name, setName] = useState(team ? team.name : '');
  const [players, setPlayers] = useState(team ? team.participants : []);

  function handleAddPlayer(username) {
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

  function handleNameChanged(e) {
    setName(e.target.value);
  }

  function handleSubmit() {
    onSubmit({ name, participants: players });
  }

  return (
    <div className="team-compose">
      <div className="team-compose__modal">
        <button className="close-btn" type="button" onClick={onCancel}>
          <img src="/img/icons/clear.svg" alt="X" />
        </button>
        <b className="modal-title">{team ? `Editing team: ${team.name}` : 'Add a new team'}</b>
        <span className="modal-label">Team Name</span>
        <TextInput placeholder="Ex: Warriors" value={name} onChange={handleNameChanged} />
        <br />
        <span className="modal-label">{`Participants (${players.length})`}</span>
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
