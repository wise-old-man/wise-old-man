import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import Analytics from 'react-ga';
import * as groupActions from 'redux/groups/actions';
import Button from '../../components/Button';
import './DeleteGroupModal.scss';

function DeleteGroupModal({ group, onCancel }) {
  const router = useHistory();
  const dispatch = useDispatch();

  const [verificationCode, setVerificationCode] = useState('');

  const handleVerificationInput = e => {
    setVerificationCode(e.target.value);
  };

  const handleDeleteClicked = async () => {
    const { payload } = await dispatch(groupActions.remove(group.id, verificationCode));

    if (payload && payload.groupId) {
      router.push('/groups');
    }
  };

  const onVerificationInput = useCallback(handleVerificationInput, []);
  const onDeleteClicked = useCallback(handleDeleteClicked, [group, verificationCode]);

  useEffect(() => Analytics.modalview(`/groups/${group.id}/delete`), [group]);

  return (
    <div className="delete-group">
      <div className="delete-group__modal">
        <button className="close-btn" type="button" onClick={onCancel}>
          <img src="/img/icons/clear.svg" alt="X" />
        </button>
        <b className="modal-title">Are you sure you want to delete this group?</b>
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
          Lost your verification code?
          <a href="https://wiseoldman.net/discord" target="_blank" rel="noopener noreferrer">
            Join our discord for help
          </a>
        </div>
        <Button text="Delete" onClick={onDeleteClicked} />
      </div>
    </div>
  );
}

DeleteGroupModal.propTypes = {
  group: PropTypes.shape().isRequired,
  onCancel: PropTypes.func.isRequired
};

export default DeleteGroupModal;
