import React, { useMemo, useCallback } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { groupActions, groupSelectors } from 'redux/groups';
import AutoSuggestInput from '../../../../components/AutoSuggestInput';
import Table from '../../../../components/Table';
import './GroupSelector.scss';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'name',
      className: () => '-primary'
    },
    {
      key: 'memberCount',
      transform: val => `${val} members`,
      width: 130
    }
  ]
};

function mapToSuggestion(group) {
  return { label: group.name, value: group.id };
}

function GroupSelector({ group, onGroupChanged }) {
  const dispatch = useDispatch();
  const searchResults = useSelector(groupSelectors.getGroups);

  const suggestions = useMemo(() => searchResults.map(mapToSuggestion), [searchResults]);

  const searchGroup = _.debounce(name => dispatch(groupActions.fetchList(name)), 500);

  const handleInputChange = text => {
    if (text && text.length) {
      searchGroup(text);
    }
  };

  function handleSelection(groupId) {
    const selectedGroup = searchResults.find(g => g.id === groupId);

    if (selectedGroup) {
      onGroupChanged(selectedGroup);
    }
  }

  const onInputChange = useCallback(handleInputChange, []);

  return (
    <div className="group-selector">
      <AutoSuggestInput
        placeholder="Search groups"
        suggestions={suggestions}
        onInput={onInputChange}
        onSelected={handleSelection}
        clearOnSelect
      />

      {group ? (
        <>
          <span className="form-row__label">Selected group</span>
          <Table
            uniqueKeySelector={TABLE_CONFIG.uniqueKey}
            columns={TABLE_CONFIG.columns}
            rows={[group]}
            listStyle
          />
        </>
      ) : (
        <span className="no-groups">
          No group is selected, please use the search bar above to select one.
        </span>
      )}
    </div>
  );
}

GroupSelector.defaultProps = {
  group: undefined
};

GroupSelector.propTypes = {
  group: PropTypes.shape(),
  onGroupChanged: PropTypes.func.isRequired
};

export default GroupSelector;
