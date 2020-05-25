import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import AutoSuggestInput from '../AutoSuggestInput';
import Table from '../Table';
import { getSearchResults } from '../../redux/selectors/players';
import searchAction from '../../redux/modules/players/actions/search';
import './MembersSelector.scss';

function getTableConfig(invalidUsernames, onRemove, onSwitchRole) {
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
        key: 'role'
      },
      {
        key: 'switch role',
        label: '',
        isSortable: false,
        width: 100,
        transform: (val, row) => (
          <button
            className="table-btn -switch-role"
            type="button"
            onClick={() => onSwitchRole(row.username)}
          >
            Switch role
          </button>
        )
      },
      {
        key: 'remove',
        label: '',
        width: 130,
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
  invalidUsernames,
  onMemberAdded,
  onMemberRemoved,
  onMemberRoleSwitched
}) {
  const dispatch = useDispatch();
  const searchResults = useSelector(state => getSearchResults(state));

  const suggestions = useMemo(() => searchResults.map(s => mapToSuggestion(s)), [searchResults]);

  const searchPlayer = _.debounce(username => dispatch(searchAction({ username })), 500);

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

  const handleRoleSwitch = username => {
    onMemberRoleSwitched(username);
  };

  const onInputChange = useCallback(handleInputChange, []);
  const onSelected = useCallback(handleSelection, []);
  const onDeselected = useCallback(handleDeselection, []);
  const onRoleSwitch = useCallback(handleRoleSwitch, []);

  const tableConfig = useMemo(() => getTableConfig(invalidUsernames, onDeselected, onRoleSwitch), [
    invalidUsernames,
    onDeselected,
    onRoleSwitch
  ]);

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
  invalidUsernames: PropTypes.arrayOf(PropTypes.string),
  onMemberAdded: PropTypes.func.isRequired,
  onMemberRemoved: PropTypes.func.isRequired,
  onMemberRoleSwitched: PropTypes.func.isRequired
};

export default MembersSelector;
