import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table } from 'components';
import { groupSelectors } from 'redux/groups';
import { PlayerContext } from '../context';

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

function Groups() {
  const { context } = useContext(PlayerContext);
  const { username } = context;

  const groups = useSelector(state => groupSelectors.getPlayerGroups(state, username));

  return (
    <div className="col">
      <Table
        uniqueKeySelector={TABLE_CONFIG.uniqueKey}
        rows={groups}
        columns={TABLE_CONFIG.columns}
        listStyle
      />
    </div>
  );
}

export default Groups;
