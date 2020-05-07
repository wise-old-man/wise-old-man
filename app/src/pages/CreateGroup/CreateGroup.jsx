import React, { useState, useCallback } from 'react';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PageTitle from '../../components/PageTitle';
import TextInput from '../../components/TextInput';
import TextButton from '../../components/TextButton';
import Button from '../../components/Button';
import MembersSelector from './components/MembersSelector';
import MembersModal from './components/MembersModal';
import VerificationModal from './components/VerificationModal';
import createGroupAction from '../../redux/modules/groups/actions/create';
import { isCreating } from '../../redux/selectors/groups';
import './CreateGroup.scss';

function CreateGroup() {
  const router = useHistory();
  const dispatch = useDispatch();

  const isSubmitting = useSelector(state => isCreating(state));

  const [name, setName] = useState('');
  const [members, setMembers] = useState([]);
  const [showingImportModal, toggleImportModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [createdId, setCreatedId] = useState(-1);

  const handleNameChanged = e => {
    setName(e.target.value);
  };

  const handleAddMember = username => {
    setMembers(currentMembers => {
      // If username is already member
      if (currentMembers.filter(m => m.username === username).length !== 0) {
        return currentMembers;
      }

      const newMember = { username, role: 'member' };
      return [...currentMembers, newMember];
    });
  };

  const handleRemoveMember = username => {
    setMembers(currentMembers => [...currentMembers.filter(m => m.username !== username)]);
  };

  const handleRoleSwitch = username => {
    setMembers(currentMembers => {
      const copy = [...currentMembers];
      const member = copy.find(m => m.username === username);

      if (member) {
        if (member.role === 'leader') {
          member.role = 'member';
        } else {
          member.role = 'leader';
        }

        return copy;
      }

      return currentMembers;
    });
  };

  const handleModalSubmit = (usernames, replace) => {
    setMembers(currentMembers => {
      if (replace) {
        return [..._.uniq(usernames).map(u => ({ username: u, role: 'member' }))];
      }

      const existingUsernames = currentMembers.map(c => c.username);
      const newUsernames = usernames.filter(u => !existingUsernames.includes(u));

      return [...currentMembers, ..._.uniq(newUsernames).map(u => ({ username: u, role: 'member' }))];
    });

    toggleImportModal(false);
  };

  const handleSubmit = async () => {
    const formData = { name, members };

    dispatch(createGroupAction(formData)).then(a => {
      if (a && a.group) {
        setVerificationCode(a.group.verificationCode);
        setCreatedId(a.group.id);
      }
    });
  };

  const handleConfirmVerification = () => {
    router.push(`/groups/${createdId}`);
  };

  const hideMembersModal = useCallback(() => toggleImportModal(false), []);
  const showMembersModal = useCallback(() => toggleImportModal(true), []);

  const onNameChanged = useCallback(handleNameChanged, []);
  const onMemberAdded = useCallback(handleAddMember, [members]);
  const onMemberRemoved = useCallback(handleRemoveMember, [members]);
  const onMemberRoleSwitched = useCallback(handleRoleSwitch, [members]);
  const onConfirmVerification = useCallback(handleConfirmVerification, [createdId]);
  const onSubmit = useCallback(handleSubmit, [name, members]);
  const onSubmitMembersModal = useCallback(handleModalSubmit, []);

  return (
    <div className="create-group__container container">
      <Helmet>
        <title>Create new group</title>
      </Helmet>

      <div className="col">
        <PageTitle title="Create new group" />

        <div className="form-row">
          <span className="form-row__label">Group name</span>
          <TextInput placeholder="Ex: Varrock Titans" onChange={onNameChanged} />
        </div>

        <div className="form-row">
          <span className="form-row__label">
            Members
            <span className="form-row__label-info">{`(${members.length} selected)`}</span>
            <TextButton text="Import list" onClick={showMembersModal} />
          </span>

          <MembersSelector
            members={members}
            onMemberAdded={onMemberAdded}
            onMemberRemoved={onMemberRemoved}
            onMemberRoleSwitched={onMemberRoleSwitched}
          />
        </div>

        <div className="form-row form-actions">
          <Button text="Confirm" onClick={onSubmit} loading={isSubmitting} />
        </div>
      </div>
      {showingImportModal && (
        <MembersModal onClose={hideMembersModal} onConfirm={onSubmitMembersModal} />
      )}
      {verificationCode && (
        <VerificationModal verificationCode={verificationCode} onConfirm={onConfirmVerification} />
      )}
    </div>
  );
}

export default CreateGroup;
