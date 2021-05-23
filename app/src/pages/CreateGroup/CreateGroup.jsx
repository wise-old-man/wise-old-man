import React, { useState, useCallback } from 'react';
import { uniq } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { groupActions, groupSelectors } from 'redux/groups';
import { PageTitle, TextInput, TextButton, MembersSelector, Button } from 'components';
import ImportPlayersModal from 'modals/ImportPlayersModal';
import MigratePlayersModal from 'modals/MigratePlayersModal';
import EmptyConfirmationModal from 'modals/EmptyConfirmationModal';
import VerificationModal from 'modals/VerificationModal';
import { ROLES } from 'config';
import './CreateGroup.scss';

function CreateGroup() {
  const router = useHistory();
  const dispatch = useDispatch();

  const isSubmitting = useSelector(groupSelectors.isCreating);
  const error = useSelector(groupSelectors.getError);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clanChat, setClanChat] = useState('');
  const [homeworld, setHomeworld] = useState('');
  const [members, setMembers] = useState([]);
  const [showingImportModal, toggleImportModal] = useState(false);
  const [showingMigrateModal, toggleMigrateModal] = useState(false);
  const [showingEmptyConfirmationModal, toggleEmptyConfirmationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [createdId, setCreatedId] = useState(-1);

  const handleNameChanged = e => {
    setName(e.target.value);
  };

  const handleDescriptionChanged = e => {
    setDescription(e.target.value);
  };

  const handleClanChatChanged = e => {
    setClanChat(e.target.value);
  };

  const handleHomeworldChanged = e => {
    setHomeworld(e.target.value);
  };

  const handleAddMember = username => {
    setMembers(currentMembers => {
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

  const handleRoleSwitch = (username, role) => {
    setMembers(currentMembers => {
      const copy = [...currentMembers];
      const member = copy.find(m => m.username === username);

      if (member) {
        member.role = role;
        return copy;
      }

      return currentMembers;
    });
  };

  const handleModalSubmit = (usernames, replace) => {
    setMembers(currentMembers => {
      if (replace) {
        return [...uniq(usernames).map(u => ({ username: u, displayName: u, role: 'member' }))];
      }

      const existingUsernames = currentMembers.map(c => c.username.toLowerCase());
      const newUsernames = usernames.filter(u => !existingUsernames.includes(u.toLowerCase()));

      return [
        ...currentMembers,
        ...uniq(newUsernames).map(u => ({ username: u, displayName: u, role: 'member' }))
      ];
    });

    toggleImportModal(false);
  };

  const handleMigrateModalSubmit = (usernames, replace) => {
    setMembers(currentMembers => {
      if (replace) {
        return [...uniq(usernames).map(u => ({ username: u, displayName: u, role: 'member' }))];
      }

      const existingUsernames = currentMembers.map(c => c.username.toLowerCase());
      const newUsernames = usernames.filter(u => !existingUsernames.includes(u.toLowerCase()));

      return [
        ...currentMembers,
        ...uniq(newUsernames).map(u => ({ username: u, displayName: u, role: 'member' }))
      ];
    });

    toggleMigrateModal(false);
  };

  const handleSubmit = async () => {
    const { payload } = await dispatch(
      groupActions.create(name, description, clanChat, homeworld, members)
    );

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

  const hideMigrateModal = useCallback(() => toggleMigrateModal(false), []);
  const showMigrateModal = useCallback(() => toggleMigrateModal(true), []);
  const hideEmptyConfirmationModal = useCallback(() => toggleEmptyConfirmationModal(false), []);
  const showEmptyConfirmationModal = useCallback(() => toggleEmptyConfirmationModal(true), []);

  const onNameChanged = useCallback(handleNameChanged, []);
  const onDescriptionChanged = useCallback(handleDescriptionChanged, []);
  const onClanChatChanged = useCallback(handleClanChatChanged, []);
  const onHomeworldChanged = useCallback(handleHomeworldChanged, []);
  const onMemberAdded = useCallback(handleAddMember, [members]);
  const onMemberRemoved = useCallback(handleRemoveMember, [members]);
  const onMemberRoleSwitched = useCallback(handleRoleSwitch, [members]);
  const onConfirmVerification = useCallback(handleConfirmVerification, [createdId]);
  const onSubmit = useCallback(handleSubmit, [name, clanChat, members]);
  const onSubmitMembersModal = useCallback(handleModalSubmit, []);
  const onSubmitMigrateModal = useCallback(handleMigrateModalSubmit, []);

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
          <span className="form-row__label">Description</span>
          <TextInput
            value={description}
            placeholder="Ex: This is the summary about the group"
            onChange={onDescriptionChanged}
            maxCharacters={100}
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
          <span className="form-row__label">Homeworld</span>
          <TextInput
            value={homeworld}
            placeholder="Ex: 492"
            onChange={onHomeworldChanged}
            maxCharacters={4}
          />
        </div>

        <div className="form-row">
          <span className="form-row__label">
            <div>
              Members
              <span className="form-row__label-info">{`(${members.length} selected)`}</span>
            </div>
            <div>
              <TextButton text="Import list" onClick={showMembersModal} />
              <span className="separator">|</span>
              <TextButton text="Migrate" onClick={showMigrateModal} />
            </div>
          </span>

          <MembersSelector
            members={members}
            roles={ROLES}
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
      {showingMigrateModal && (
        <MigratePlayersModal onClose={hideMigrateModal} onConfirm={onSubmitMigrateModal} />
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
