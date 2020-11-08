import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import Analytics from 'react-ga';
import * as competitionActions from 'redux/competitions/actions';
import Button from '../../components/Button';
import './DeleteCompetitionModal.scss';

function DeleteCompetitionModal({ competition, onCancel }) {
  const router = useHistory();
  const dispatch = useDispatch();

  const [verificationCode, setVerificationCode] = useState('');

  const handleVerificationInput = e => {
    setVerificationCode(e.target.value);
  };

  const handleDeleteClicked = async () => {
    const { payload } = await dispatch(competitionActions.remove(competition.id, verificationCode));

    if (payload && payload.competitionId) {
      router.push('/competitions');
    }
  };

  const onVerificationInput = useCallback(handleVerificationInput, []);
  const onDeleteClicked = useCallback(handleDeleteClicked, [competition, verificationCode]);

  useEffect(() => Analytics.modalview(`/competitions/${competition.id}/delete`), [competition]);

  return (
    <div className="delete-competition">
      <div className="delete-competition__modal">
        <button className="close-btn" type="button" onClick={onCancel}>
          <img src="/img/icons/clear.svg" alt="X" />
        </button>
        <b className="modal-title">Are you sure you want to delete this competition?</b>
        <span className="modal-warning">This action is permanent and cannot be reversed</span>
        <input
          className="verification-input"
          value={verificationCode}
          type="text"
          placeholder="Verification code"
          onChange={onVerificationInput}
          autoComplete="off"
        />
        <div className="lost-code">
          {`Lost your${competition.groupId ? ' group' : ''} verification code?`}
          <a href="https://wiseoldman.net/discord" target="_blank" rel="noopener noreferrer">
            Join our discord for help
          </a>
        </div>
        <Button text="Delete" onClick={onDeleteClicked} />
      </div>
    </div>
  );
}

DeleteCompetitionModal.propTypes = {
  competition: PropTypes.shape().isRequired,
  onCancel: PropTypes.func.isRequired
};

export default DeleteCompetitionModal;
