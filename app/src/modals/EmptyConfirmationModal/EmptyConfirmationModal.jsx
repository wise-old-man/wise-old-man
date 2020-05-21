import React from 'react';
import PropTypes from 'prop-types';
import TextButton from '../../components/TextButton';
import Button from '../../components/Button';
import './EmptyConfirmationModal.scss';

function EmptyConfirmationModal({ entity, onConfirm, onClose }) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="empty-confirmation-modal">
      <div className="empty-confirmation-modal__modal">
        <h1 className="modal-title">{`No ${entity.group}s!`}</h1>
        <p className="modal-description">
          {`You are creating a ${entity.type} with no ${entity.group}s. Are you sure you want to continue?`}
        </p>
        <div className="modal-actions">
          <TextButton text="No" onClick={onClose} />
          <Button text="Yes" onClick={handleConfirm} />
        </div>
      </div>
    </div>
  );
}

EmptyConfirmationModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  entity: PropTypes.shape({ type: PropTypes.string, group: PropTypes.string }).isRequired
};

export default EmptyConfirmationModal;
