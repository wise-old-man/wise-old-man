import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'components';
import './CustomConfirmationModal.scss';

const WAIT_TIMER = 5;

function CustomConfirmationModal({ title, message, onConfirm }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (tick < WAIT_TIMER) setTimeout(() => setTick(tick + 1), 1000);
  }, [tick]);

  return (
    <div className="custom-confirmation-modal">
      <div className="custom-confirmation-modal__modal">
        <h1 className="modal-title">{title}</h1>
        <p className="modal-description">{message}</p>
        <Button
          text={tick < WAIT_TIMER ? `Please read the text above (${WAIT_TIMER - tick})` : 'Ok, I got it'}
          onClick={onConfirm}
          disabled={tick < WAIT_TIMER}
        />
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
