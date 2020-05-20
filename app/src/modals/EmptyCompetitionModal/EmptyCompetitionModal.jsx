import React from 'react';
import PropTypes from 'prop-types';
import TextButton from '../../components/TextButton';
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
        <p className="modal-description">
          You are creating a competition with no participants. Are you sure you want to continue?
        </p>
        <div className="modal-actions">
          <TextButton text="No" onClick={onClose} />
          <Button text="Yes" onClick={handleConfirm} />
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
