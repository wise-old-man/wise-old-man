import React, { useState, useMemo, useCallback } from 'react';
import { GroupRoleProps } from '@wise-old-man/utils';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { getRoleTypeIcon } from 'utils';
import { playerActions, playerSelectors } from 'redux/players';
import AutoSuggestInput from '../AutoSuggestInput';
import Selector from '../Selector';
import Table from '../Table';
import './MembersSelector.scss';

function getTableConfig(
  invalidUsernames,
  onRemove,
  onSwitchRole,
  roles,
  editedRoleMembers,
  setEditedRoleMembers
) {
  const isInvalid = username => invalidUsernames && invalidUsernames.includes(username);

  return {
    uniqueKeySelector: row => row.username,
    columns: [
      {
        key: 'displayName',
        label: 'Name',
        width: 170,
        className: (val, row) => (isInvalid(row ? row.username : '') ? '-negative' : '-primary')
      },
      {
        key: 'role',
        label: 'Role',
        isSortable: false,
        width: 200,
        transform: (val, row) => {
          const isEdited = editedRoleMembers.find(e => e === row.username);

          if (isEdited) {
            return (
              <Selector
                options={roles}
                selectedIndex={roles.findIndex(o => o.value === row.role)}
                onSelect={option => onSwitchRole(row.username, option.value)}
                search
              />
            );
          }

          return (
            <div className="role">
              <img src={getRoleTypeIcon(val)} alt="" />
              <span>{GroupRoleProps[val].name}</span>
              <button type="button" onClick={() => setEditedRoleMembers(e => [...e, row.username])}>
                (Change)
              </button>
            </div>
          );
        }
      },
      {
        key: 'remove',
        label: '',
        width: 90,
        isSortable: false,
        transform: (val, row) => (
          <button className="table-btn -remove" type="button" onClick={() => onRemove(row.username)}>
            Remove member
          </button>
        )
      }
    ]
  };
}

const mapToSuggestion = player => ({ label: player.displayName, value: player.username });

function MembersSelector({
  members,
  roles,
  invalidUsernames,
  onMemberAdded,
  onMemberRemoved,
  onMemberRoleSwitched
}) {
  const dispatch = useDispatch();
  const searchResults = useSelector(playerSelectors.getSearchResults);

  const [editedRoleMembers, setEditedRoleMembers] = useState([]);

  const suggestions = useMemo(() => searchResults.map(s => mapToSuggestion(s)), [searchResults]);

  const searchPlayer = debounce(username => dispatch(playerActions.searchPlayers(username)), 500);

  const handleInputChange = text => {
    if (text && text.length) {
      searchPlayer(text);
    }
  };

  const handleSelection = username => {
    onMemberAdded(username);
  };

  const handleDeselection = username => {
    onMemberRemoved(username);
  };

  const handleRoleSwitch = (username, role) => {
    onMemberRoleSwitched(username, role);
  };

  const onInputChange = useCallback(handleInputChange, []);
  const onSelected = useCallback(handleSelection, []);
  const onDeselected = useCallback(handleDeselection, []);
  const onRoleSwitch = useCallback(handleRoleSwitch, []);

  const tableConfig = useMemo(
    () =>
      getTableConfig(
        invalidUsernames,
        onDeselected,
        onRoleSwitch,
        roles,
        editedRoleMembers,
        setEditedRoleMembers
      ),
    [invalidUsernames, onDeselected, onRoleSwitch, roles, editedRoleMembers, setEditedRoleMembers]
  );

  return (
    <div className="members-selector">
      <AutoSuggestInput
        suggestions={suggestions}
        onInput={onInputChange}
        onSelected={onSelected}
        placeholder="Search players"
        clearOnSelect
      />
      {members && members.length > 0 ? (
        <Table
          uniqueKeySelector={tableConfig.uniqueKeySelector}
          columns={tableConfig.columns}
          rows={members}
        />
      ) : (
        <span className="empty-selected">No players selected</span>
      )}
    </div>
  );
}

MembersSelector.defaultProps = {
  invalidUsernames: []
};

MembersSelector.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  roles: PropTypes.arrayOf(PropTypes.object).isRequired,
  invalidUsernames: PropTypes.arrayOf(PropTypes.string),
  onMemberAdded: PropTypes.func.isRequired,
  onMemberRemoved: PropTypes.func.isRequired,
  onMemberRoleSwitched: PropTypes.func.isRequired
};

export default MembersSelector;
