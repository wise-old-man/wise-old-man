import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/Button';
import './EmptyCompetitionModal.scss';

function EmptyCompetitionModal({ onConfirm, onClose }) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="empty-competition-modal">
      <div className="empty-competition-modal__modal">
        <h1 className="modal-title">No participants!</h1>
        <p className="modal-description">You are creating a competition with no participants.</p>
        <span className="modal-warning">Are you sure?</span>
        <div className="modal-actions">
          <Button text="Yes" onClick={handleConfirm} />
          <Button text="No" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

EmptyCompetitionModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default EmptyCompetitionModal;
