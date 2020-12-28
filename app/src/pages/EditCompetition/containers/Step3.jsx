import React, { useContext } from 'react';
import { TextInput } from 'components';
import { EditCompetitionContext } from '../context';

function Step3() {
  const { data, setData } = useContext(EditCompetitionContext);
  const { groupCompetition, verificationCode } = data;

  function handleCodeChanged(e) {
    const newCode = e.target.value;
    setData(d => ({ ...d, verificationCode: newCode }));
  }

  return (
    <div className="step3__container">
      <div className="form-row">
        <p className="info-body">
          {groupCompetition
            ? "One last step! Please insert your group's verification code."
            : 'One last step! Please insert the verification code you were given when this competition was created.'}
        </p>
      </div>
      <div className="form-row">
        <span className="form-row__label">
          {groupCompetition ? 'Group verification code' : 'Verification code'}
          <span className="form-row__label-info -right">
            Lost your verification code?
            <a href="https://wiseoldman.net/discord" target="_blank" rel="noopener noreferrer">
              Join our discord
            </a>
          </span>
        </span>
        <TextInput
          type="password"
          value={verificationCode}
          placeholder="Ex: 123-456-789"
          onChange={handleCodeChanged}
        />
      </div>
    </div>
  );
}

export default Step3;
