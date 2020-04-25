import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import TableList from '../../../../components/TableList';

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

function PlayerGroupsTable({ groups }) {
  const router = useHistory();

  const handleRowClicked = index => {
    router.push(`/groups/${groups[index].id}`);
  };

  const onRowClicked = useCallback(handleRowClicked, [router, groups]);

  return (
    <TableList
      uniqueKeySelector={TABLE_CONFIG.uniqueKey}
      rows={groups}
      columns={TABLE_CONFIG.columns}
      clickable
      onRowClicked={onRowClicked}
    />
  );
}

PlayerGroupsTable.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.shape).isRequired
};

export default React.memo(PlayerGroupsTable);
