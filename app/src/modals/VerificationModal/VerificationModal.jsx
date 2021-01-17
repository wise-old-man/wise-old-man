import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, CopyToClipboard } from 'components';
import './VerificationModal.scss';

const WAIT_TIMER = 10;

function VerificationModal({ verificationCode, entity, onConfirm }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (tick < WAIT_TIMER) setTimeout(() => setTick(tick + 1), 1000);
  }, [tick]);

  return (
    <div className="verification-modal">
      <div className="verification-modal__modal">
        <span className="code-label">{`Your ${entity}'s verification code is:`}</span>
        <h1 className="code-value">
          <CopyToClipboard>{verificationCode}</CopyToClipboard>
        </h1>
        <p className="code-description">
          {` Please save this code somewhere, without it you won't \
             be able to edit or delete this ${entity} in the future.`}
        </p>
        <Button
          text={tick < WAIT_TIMER ? `Please read the text above (${WAIT_TIMER - tick})` : 'Ok, I got it'}
          onClick={onConfirm}
          disabled={tick < WAIT_TIMER}
        />
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
