import React, { useState, useCallback } from 'react';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as groupActions from 'redux/groups/actions';
import * as groupSelectors from 'redux/groups/selectors';
import PageTitle from '../../components/PageTitle';
import TextInput from '../../components/TextInput';
import TextButton from '../../components/TextButton';
import MembersSelector from '../../components/MembersSelector';
import Button from '../../components/Button';
import ImportPlayersModal from '../../modals/ImportPlayersModal';
import EmptyConfirmationModal from '../../modals/EmptyConfirmationModal';
import VerificationModal from '../../modals/VerificationModal';
import './CreateGroup.scss';

function CreateGroup() {
  const router = useHistory();
  const dispatch = useDispatch();

  const isSubmitting = useSelector(groupSelectors.isCreating);
  const error = useSelector(groupSelectors.getError);

  const [name, setName] = useState('');
  const [clanChat, setClanChat] = useState('');
  const [members, setMembers] = useState([]);
  const [showingImportModal, toggleImportModal] = useState(false);
  const [showingEmptyConfirmationModal, toggleEmptyConfirmationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [createdId, setCreatedId] = useState(-1);

  const handleNameChanged = e => {
    setName(e.target.value);
  };

  const handleClanChatChanged = e => {
    setClanChat(e.target.value);
  };

  const handleAddMember = username => {
    setMembers(currentMembers => {
      // If username is already member
      if (currentMembers.filter(m => m.username.toLowerCase() === username.toLowerCase()).length !== 0) {
        return currentMembers;
      }

      const newMember = { username, displayName: username, role: 'member' };
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
        return [..._.uniq(usernames).map(u => ({ username: u, displayName: u, role: 'member' }))];
      }

      const existingUsernames = currentMembers.map(c => c.username.toLowerCase());
      const newUsernames = usernames.filter(u => !existingUsernames.includes(u.toLowerCase()));

      return [
        ...currentMembers,
        ..._.uniq(newUsernames).map(u => ({ username: u, displayName: u, role: 'member' }))
      ];
    });

    toggleImportModal(false);
  };

  const handleSubmit = async () => {
    const { payload } = await dispatch(groupActions.create(name, clanChat, members));

    if (payload && payload.data) {
      setVerificationCode(payload.data.verificationCode);
      setCreatedId(payload.data.id);
    }
  };

  const handleConfirmVerification = () => {
    router.push(`/groups/${createdId}`);
  };

  const hideMembersModal = useCallback(() => toggleImportModal(false), []);
  const showMembersModal = useCallback(() => toggleImportModal(true), []);
  const hideEmptyConfirmationModal = useCallback(() => toggleEmptyConfirmationModal(false), []);
  const showEmptyConfirmationModal = useCallback(() => toggleEmptyConfirmationModal(true), []);

  const onNameChanged = useCallback(handleNameChanged, []);
  const onClanChatChanged = useCallback(handleClanChatChanged, []);
  const onMemberAdded = useCallback(handleAddMember, [members]);
  const onMemberRemoved = useCallback(handleRemoveMember, [members]);
  const onMemberRoleSwitched = useCallback(handleRoleSwitch, [members]);
  const onConfirmVerification = useCallback(handleConfirmVerification, [createdId]);
  const onSubmit = useCallback(handleSubmit, [name, clanChat, members]);
  const onSubmitMembersModal = useCallback(handleModalSubmit, []);

  const isEmpty = members.length === 0;

  return (
    <div className="create-group__container container">
      <Helmet>
        <title>Create new group</title>
      </Helmet>

      <div className="col">
        <PageTitle title="Create new group" />

        <div className="form-row">
          <span className="form-row__label">Group name</span>
          <TextInput
            value={name}
            placeholder="Ex: Varrock Titans"
            onChange={onNameChanged}
            maxCharacters={30}
          />
        </div>

        <div className="form-row">
          <span className="form-row__label">Clan Chat</span>
          <TextInput
            value={clanChat}
            placeholder="Ex: titanZ"
            onChange={onClanChatChanged}
            maxCharacters={12}
          />
        </div>

        <div className="form-row">
          <span className="form-row__label">
            Members
            <span className="form-row__label-info">{`(${members.length} selected)`}</span>
            <TextButton text="Import list" onClick={showMembersModal} />
          </span>

          <MembersSelector
            members={members}
            invalidUsernames={error.data}
            onMemberAdded={onMemberAdded}
            onMemberRemoved={onMemberRemoved}
            onMemberRoleSwitched={onMemberRoleSwitched}
          />
        </div>

        <div className="form-row form-actions">
          <Button
            text="Confirm"
            onClick={isEmpty ? showEmptyConfirmationModal : onSubmit}
            loading={isSubmitting}
          />
        </div>
      </div>
      {showingImportModal && (
        <ImportPlayersModal onClose={hideMembersModal} onConfirm={onSubmitMembersModal} />
      )}
      {verificationCode && (
        <VerificationModal
          entity="group"
          verificationCode={verificationCode}
          onConfirm={onConfirmVerification}
        />
      )}
      {showingEmptyConfirmationModal && (
        <EmptyConfirmationModal
          entity={{ type: 'group', group: 'member' }}
          onClose={hideEmptyConfirmationModal}
          onConfirm={onSubmit}
        />
      )}
    </div>
  );
}

export default CreateGroup;
