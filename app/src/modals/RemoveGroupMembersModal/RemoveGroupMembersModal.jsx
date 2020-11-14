import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Analytics from 'react-ga';
import Button from '../../components/Button';
import './RemoveGroupMembersModal.scss';

function RemoveGroupMembersModal({ groupId, members, onSubmit, onClose }) {
  useEffect(() => Analytics.modalview(`/groups/${groupId}/removeMembers`), [groupId]);

  return (
    <div className="remove-group-members">
      <div className="remove-group-members__modal">
        <button className="close-btn" type="button" onClick={onClose}>
          <img src="/img/icons/clear.svg" alt="X" />
        </button>
        <b className="modal-title">Are you sure you want to remove following members from this group?</b>
        <p>{members.map(m => m.displayName).join(', ')}</p>
        <Button text="Remove group members" onClick={onSubmit} />
      </div>
    </div>
  );
}

RemoveGroupMembersModal.propTypes = {
  groupId: PropTypes.number.isRequired,
  members: PropTypes.arrayOf(PropTypes.shape).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default RemoveGroupMembersModal;
