import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '../../../../components/Button';
import deleteCompetitionAction from '../../../../redux/modules/competitions/actions/delete';
import './DeleteCompetitionPopup.scss';

function DeleteCompetitionPopup({ competition, onCancel }) {
  const router = useHistory();
  const dispatch = useDispatch();

  const [verificationCode, setVerificationCode] = useState('');

  const handleVerificationInput = e => {
    setVerificationCode(e.target.value);
  };

  const handleDeleteClicked = () => {
    dispatch(deleteCompetitionAction(competition.id, verificationCode)).then(() => {
      router.push('/competitions');
    });
  };

  const onVerificationInput = useCallback(handleVerificationInput, []);
  const onDeleteClicked = useCallback(handleDeleteClicked, [competition, verificationCode]);

  return (
    <div className="delete-competition">
      <div className="delete-competition__modal">
        <button className="close-btn" type="button" onClick={onCancel}>
          <img src="/img/icons/clear.svg" alt="X" />
        </button>
        <b className="modal-title">{`Delete ${competition.title}?`}</b>
        <span className="modal-warning">This action is permanent and cannot be reversed</span>
        <input
          className="verification-input"
          value={verificationCode}
          type="text"
          placeholder="Verification code"
          onChange={onVerificationInput}
        />
        <Button text="Delete" onClick={onDeleteClicked} />
      </div>
    </div>
  );
}

DeleteCompetitionPopup.propTypes = {
  competition: PropTypes.shape().isRequired,
  onCancel: PropTypes.func.isRequired
};

export default DeleteCompetitionPopup;
