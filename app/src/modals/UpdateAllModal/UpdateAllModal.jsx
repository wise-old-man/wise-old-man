import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'components';
import './UpdateAllModal.scss';

function UpdateAllModal({ entityName, onCancel, onSubmit }) {
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerificationInput = e => {
    setVerificationCode(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(verificationCode);
  };

  const isButtonDisabled = verificationCode.length < 11;

  return (
    <div className="update-all">
      <div className="update-all__modal">
        <button className="close-btn" type="button" onClick={onCancel}>
          <img src="/img/icons/clear.svg" alt="X" />
        </button>
        <span className="modal-note">{`This action requires this ${entityName}'s verification code.`}</span>
        <input
          className="verification-input"
          value={verificationCode}
          type="password"
          placeholder="Verification code"
          onChange={handleVerificationInput}
          autoComplete="off"
        />
        <div className="lost-code">
          Lost your verification code?
          <a href="https://wiseoldman.net/discord" target="_blank" rel="noopener noreferrer">
            Join our discord for help
          </a>
        </div>
        <Button text="Update All" onClick={handleSubmit} disabled={isButtonDisabled} />
        <span className="modal-warning">
          We've recently updated the cooldowns for the "Update All" feature. &nbsp;
          <a href="https://wiseoldman.net/discord">
            Read all about it in our discord's #announcements channel.
          </a>
        </span>
      </div>
    </div>
  );
}

UpdateAllModal.propTypes = {
  entityName: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default UpdateAllModal;
