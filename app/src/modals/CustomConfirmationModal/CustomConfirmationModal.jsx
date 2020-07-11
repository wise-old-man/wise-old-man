import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/Button';
import './CustomConfirmationModal.scss';

function CustomConfirmationModal({ title, message, onConfirm }) {
  return (
    <div className="custom-confirmation-modal">
      <div className="custom-confirmation-modal__modal">
        <h1 className="modal-title">{title}</h1>
        <p className="modal-description">{message}</p>
        <Button text="Ok, I got it" onClick={onConfirm} />
      </div>
    </div>
  );
}

CustomConfirmationModal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default CustomConfirmationModal;
