import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import TableList from '../../../../components/TableList';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'name',
      className: () => '-primary',
      transform: (val, row) => <Link to={`/groups/${row.id}`}>{val}</Link>
    },
    {
      key: 'memberCount',
      transform: val => `${val} members`,
      width: 130
    }
  ]
};

function PlayerGroupsTable({ groups }) {
  return (
    <TableList uniqueKeySelector={TABLE_CONFIG.uniqueKey} rows={groups} columns={TABLE_CONFIG.columns} />
  );
}

PlayerGroupsTable.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.shape).isRequired
};

export default React.memo(PlayerGroupsTable);
