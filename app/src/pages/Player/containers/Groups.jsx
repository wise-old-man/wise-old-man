import React, { useContext, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, TablePlaceholder, RoleTag } from 'components';
import { groupSelectors, groupActions } from 'redux/groups';
import { PlayerContext } from '../context';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'name',
      className: () => '-primary',
      transform: (_, row) => <Link to={`/groups/${row.group.id}`}>{row.group.name}</Link>,
      width: 250
    },
    {
      key: 'role',
      transform: value => <RoleTag role={value} />
    },
    {
      key: 'memberCount',
      get: row => row.group.memberCount,
      transform: val => `${val} members`,
      width: 130
    }
  ]
};

function Groups() {
  const dispatch = useDispatch();
  const { context } = useContext(PlayerContext);

  const { username } = context;

  const isLoading = useSelector(groupSelectors.isFetchingList);
  const groups = useSelector(groupSelectors.getPlayerGroups(username));

  const fetchGroups = useCallback(() => {
    // Fetch player groups, if not loaded yet
    if (!groups) {
      dispatch(groupActions.fetchPlayerGroups(username));
    }
  }, [dispatch, username, groups]);

  useEffect(fetchGroups, [fetchGroups]);

  return (
    <div className="col">
      {isLoading ? (
        <TablePlaceholder size={3} />
      ) : (
        <Table
          uniqueKeySelector={TABLE_CONFIG.uniqueKey}
          rows={groups}
          columns={TABLE_CONFIG.columns}
          listStyle
        />
      )}
    </div>
  );
}

export default Groups;
