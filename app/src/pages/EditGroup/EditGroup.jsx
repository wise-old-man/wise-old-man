import React, { useState, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PageTitle from '../../components/PageTitle';
import TextInput from '../../components/TextInput';
import TextButton from '../../components/TextButton';
import Button from '../../components/Button';
import MembersSelector from '../../components/MembersSelector';
import ImportPlayersModal from '../../modals/ImportPlayersModal';
import editGroupAction from '../../redux/modules/groups/actions/edit';
import fetchDetailsAction from '../../redux/modules/groups/actions/fetchDetails';
import fetchMembersAction from '../../redux/modules/groups/actions/fetchMembers';
import { getGroup, isEditing, getError } from '../../redux/selectors/groups';
import './EditGroup.scss';

function EditGroup() {
  const { id } = useParams();
  const router = useHistory();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [clanChat, setClanChat] = useState('');
  const [members, setMembers] = useState([]);
  const [showingImportModal, toggleImportModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const group = useSelector(state => getGroup(state, parseInt(id, 10)));
  const error = useSelector(state => getError(state));
  const isSubmitting = useSelector(state => isEditing(state));

  const fetchDetails = () => {
    dispatch(fetchDetailsAction(id));
    dispatch(fetchMembersAction(id));
  };

  const populate = () => {
    if (group) {
      setName(group.name);
      setClanChat(group.clanChat || '');
      setMembers(
        group.members.map(({ username, displayName, role }) => ({ username, displayName, role }))
      );
    }
  };

  const handleNameChanged = e => {
    setName(e.target.value);
  };

  const handleClanChatChanged = e => {
    setClanChat(e.target.value);
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
    const formData = { name, members, clanChat, verificationCode };

    dispatch(editGroupAction(group.id, formData)).then(a => {
      if (a && a.group) {
        router.push(`/groups/${group.id}`);
      }
    });
  };

  const hideMembersModal = useCallback(() => toggleImportModal(false), []);
  const showMembersModal = useCallback(() => toggleImportModal(true), []);

  const onNameChanged = useCallback(handleNameChanged, []);
  const onClanChatChanged = useCallback(handleClanChatChanged, []);
  const onMemberAdded = useCallback(handleAddMember, [members]);
  const onMemberRemoved = useCallback(handleRemoveMember, [members]);
  const onMemberRoleSwitched = useCallback(handleRoleSwitch, [members]);
  const onVerificationChanged = useCallback(handleVerificationChanged, []);
  const onSubmitMembersModal = useCallback(handleModalSubmit, []);
  const onSubmit = useCallback(handleSubmit, [name, clanChat, members, verificationCode]);

  // Fetch competition details, on mount
  useEffect(fetchDetails, [dispatch, id]);
  useEffect(populate, [group]);

  if (!group) {
    return null;
  }

  return (
    <div className="create-group__container container">
      <Helmet>
        <title>{`Edit: ${group.name}`}</title>
      </Helmet>

      <div className="col">
        <PageTitle title="Edit group" />

        <div className="form-row">
          <span className="form-row__label">Group name</span>
          <TextInput value={name} placeholder="Ex: Varrock Titans" onChange={onNameChanged} />
        </div>

        <div className="form-row">
          <span className="form-row__label">Clan chat</span>
          <TextInput placeholder="Ex: titanZ" value={clanChat} onChange={onClanChatChanged} />
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
          <Button text="Confirm" onClick={onSubmit} loading={isSubmitting} />
        </div>
      </div>
      {showingImportModal && (
        <ImportPlayersModal onClose={hideMembersModal} onConfirm={onSubmitMembersModal} />
      )}
    </div>
  );
}

export default EditGroup;
