import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Analytics from 'react-ga';
import Button from '../../components/Button';
import './RemoveParticipantsModal.scss';

function RemoveParticipantsModal({ competitionId, participants, onSubmit, onClose }) {
  useEffect(() => Analytics.modalview(`/competitions/${competitionId}/removeParticipants`), [
    competitionId
  ]);

  return (
    <div className="remove-participants">
      <div className="remove-participants__modal">
        <button className="close-btn" type="button" onClick={onClose}>
          <img src="/img/icons/clear.svg" alt="X" />
        </button>
        <b className="modal-title">
          Are you sure you want to remove following participants from this competition?
        </b>
        {participants.map(participant => (
          <p key={participant}>{participant}</p>
        ))}
        <Button text="Remove participants" onClick={onSubmit} />
      </div>
    </div>
  );
}

RemoveParticipantsModal.propTypes = {
  competitionId: PropTypes.number.isRequired,
  participants: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default RemoveParticipantsModal;
