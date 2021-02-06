import React, { useState, useCallback, useEffect } from 'react';
import { uniq } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { groupActions, groupSelectors } from 'redux/groups';
import { standardize } from 'utils/player';
import { PageTitle, TextInput, TextButton, MembersSelector, Button } from 'components';
import ImportPlayersModal from 'modals/ImportPlayersModal';
import RemovePlayersModal from 'modals/RemovePlayersModal';
import './EditGroup.scss';

const mapMember = ({ username, displayName, role }) => ({ username, displayName, role });

function EditGroup() {
  const { id } = useParams();
  const router = useHistory();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clanChat, setClanChat] = useState('');
  const [homeworld, setHomeworld] = useState('');
  const [members, setMembers] = useState([]);
  const [removedPlayers, setRemovedPlayers] = useState([]);
  const [showingImportModal, toggleImportModal] = useState(false);
  const [showingRemovePlayersModal, toggleRemovePlayersModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const group = useSelector(state => groupSelectors.getGroup(state, parseInt(id, 10)));
  const error = useSelector(groupSelectors.getError);
  const isSubmitting = useSelector(groupSelectors.isEditing);

  const fetchDetails = () => {
    dispatch(groupActions.fetchDetails(id));
    dispatch(groupActions.fetchMembers(id));
  };

  const populate = () => {
    if (group) {
      setName(group.name);
      setDescription(group.description);
      setClanChat(group.clanChat || '');
      setHomeworld(group.homeworld);
      setMembers(group.members.map(mapMember));
    }
  };

  const findRemovedMembers = () => {
    if (group) {
      const removedMembers = group.members
        .filter(m => !members.find(c => standardize(m.username) === standardize(c.username)))
        .map(m => m.displayName);

      setRemovedPlayers(removedMembers);
    }
  };

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

  const handleVerificationChanged = e => {
    setVerificationCode(e.target.value);
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

  const handleRemovePlayersModalConfirm = () => {
    toggleRemovePlayersModal(false);
    onSubmit();
  };

  const handleSubmit = async () => {
    const { payload } = await dispatch(
      groupActions.edit(id, name, description, clanChat, homeworld, members, verificationCode)
    );

    if (payload && payload.data) {
      router.push(`/groups/${group.id}`);
    }
  };

  const hideMembersModal = useCallback(() => toggleImportModal(false), []);
  const showMembersModal = useCallback(() => toggleImportModal(true), []);
  const hideRemovePlayersModal = useCallback(() => toggleRemovePlayersModal(false), []);
  const showRemovePlayersModal = useCallback(() => toggleRemovePlayersModal(true), []);

  const onNameChanged = useCallback(handleNameChanged, []);
  const onDescriptionChanged = useCallback(handleDescriptionChanged, []);
  const onClanChatChanged = useCallback(handleClanChatChanged, []);
  const onHomeworldChanged = useCallback(handleHomeworldChanged, []);
  const onMemberAdded = useCallback(handleAddMember, [members]);
  const onMemberRemoved = useCallback(handleRemoveMember, [members]);
  const onMemberRoleSwitched = useCallback(handleRoleSwitch, [members]);
  const onVerificationChanged = useCallback(handleVerificationChanged, []);
  const onSubmitMembersModal = useCallback(handleModalSubmit, []);
  const onConfirmRemovePlayersModal = useCallback(handleRemovePlayersModalConfirm, [
    name,
    clanChat,
    description,
    homeworld,
    members,
    verificationCode
  ]);
  const onSubmit = useCallback(handleSubmit, [
    name,
    clanChat,
    description,
    homeworld,
    members,
    verificationCode
  ]);

  // Fetch competition details, on mount
  useEffect(fetchDetails, [dispatch, id]);
  useEffect(populate, [group]);

  useEffect(findRemovedMembers, [group, members]);

  if (!group) {
    return null;
  }

  return (
    <div className="edit-group__container container">
      <Helmet>
        <title>{`Edit: ${group.name}`}</title>
      </Helmet>

      <div className="col">
        <PageTitle title="Edit group" />

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
          <span className="form-row__label">Clan chat</span>
          <TextInput
            placeholder="Ex: titanZ"
            value={clanChat}
            onChange={onClanChatChanged}
            maxCharacters={12}
          />
        </div>

        <div className="form-row">
          <span className="form-row__label">Homeworld</span>
          <TextInput
            placeholder="Ex: 492"
            value={homeworld}
            onChange={onHomeworldChanged}
            maxCharacters={4}
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

        <div className="form-row">
          <span className="form-row__label">
            Verification code
            <span className="form-row__label-info -right">
              Lost your verification code?
              <a href="https://wiseoldman.net/discord" target="_blank" rel="noopener noreferrer">
                Join our discord
              </a>
            </span>
          </span>
          <TextInput type="password" placeholder="Ex: 123-456-789" onChange={onVerificationChanged} />
        </div>

        <div className="form-row form-actions">
          <Button
            text="Confirm"
            onClick={removedPlayers.length > 0 ? showRemovePlayersModal : onSubmit}
            loading={isSubmitting}
          />
        </div>
      </div>
      {showingImportModal && (
        <ImportPlayersModal onClose={hideMembersModal} onConfirm={onSubmitMembersModal} />
      )}
      {showingRemovePlayersModal && (
        <RemovePlayersModal
          modalView={`/groups/${group.id}/removeMembers`}
          players={removedPlayers}
          onClose={hideRemovePlayersModal}
          onConfirm={onConfirmRemovePlayersModal}
        />
      )}
    </div>
  );
}

export default EditGroup;
