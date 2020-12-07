import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Analytics from 'react-ga';
import Button from '../../components/Button';
import './RemovePlayersModal.scss';

function RemovePlayersModal({ modalView, players, onConfirm, onClose }) {
  useEffect(() => Analytics.modalview(modalView), [modalView]);

  return (
    <div className="remove-players">
      <div className="remove-players__modal">
        <button className="close-btn" type="button" onClick={onClose}>
          <img src="/img/icons/clear.svg" alt="X" />
        </button>
        <b className="modal-title">Are you sure you want to remove the following players?</b>
        <p className="remove-players__list">{players.join(', ')}</p>
        <Button text="Remove players" onClick={onConfirm} />
      </div>
    </div>
  );
}

RemovePlayersModal.propTypes = {
  modalView: PropTypes.string.isRequired,
  players: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default RemovePlayersModal;
