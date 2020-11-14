import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table } from 'components';

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
    <Table
      uniqueKeySelector={TABLE_CONFIG.uniqueKey}
      rows={groups}
      columns={TABLE_CONFIG.columns}
      listStyle
    />
  );
}

PlayerGroupsTable.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.shape).isRequired
};

export default React.memo(PlayerGroupsTable);
