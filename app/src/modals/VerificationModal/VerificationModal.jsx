import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/Button';
import './VerificationModal.scss';

function VerificationModal({ verificationCode, entity, onConfirm }) {
  return (
    <div className="verification-modal">
      <div className="verification-modal__modal">
        <span className="code-label">{`Your ${entity}'s verification code is:`}</span>
        <h1 className="code-value">{verificationCode}</h1>
        <p className="code-description">
          {` Please save this code somewhere, without it you won't \
             be able to edit or delete this ${entity} in the future.`}
        </p>
        <Button text="Ok, I got it" onClick={onConfirm} />
      </div>
    </div>
  );
}

VerificationModal.propTypes = {
  verificationCode: PropTypes.string.isRequired,
  entity: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default VerificationModal;
