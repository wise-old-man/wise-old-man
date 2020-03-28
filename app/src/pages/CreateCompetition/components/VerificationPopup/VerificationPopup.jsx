import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../components/Button';
import './VerificationPopup.scss';

function VerificationPopup({ verificationCode, onConfirm }) {
  return (
    <div className="verification-popup">
      <div className="verification-popup__modal">
        <span className="code-label">Your competition&apos;s verification code is:</span>
        <h1 className="code-value">{verificationCode}</h1>
        <p className="code-description">
          Please save this code somewhere, without it you won&apos;t be able to edit or delete the
          competition in the future.
        </p>
        <Button text="Ok, I got it" onClick={onConfirm} />
      </div>
    </div>
  );
}

VerificationPopup.propTypes = {
  verificationCode: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default VerificationPopup;
