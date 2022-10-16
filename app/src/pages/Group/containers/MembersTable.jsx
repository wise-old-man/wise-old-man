import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { groupSelectors } from 'redux/groups';
import { Link } from 'react-router-dom';
import { Table, PlayerTag, NumberLabel, TextLabel, RoleTag, TablePlaceholder } from 'components';
import { durationBetween } from 'utils';
import { GroupContext } from '../context';

const TABLE_CONFIG = {
  uniqueKeySelector: row => row.player.username,
  columns: [
    {
      key: 'displayName',
      label: 'Name',
      className: () => '-primary',
      get: row => row.player.displayName,
      transform: (_, row) => (
        <Link to={`/players/${row.player.username}`}>
          <PlayerTag
            name={row.player.displayName}
            type={row.player.type}
            flagged={row.player.flagged}
            country={row.player.country}
          />
        </Link>
      )
    },
    {
      key: 'role',
      transform: value => <RoleTag role={value} />
    },
    {
      key: 'exp',
      label: 'Exp.',
      get: row => row.player.exp,
      transform: val => {
        return val === -1 ? (
          <TextLabel value="---" popupValue="Unranked" />
        ) : (
          <NumberLabel value={val} />
        );
      }
    },
    {
      key: 'ehp',
      label: 'EHP',
      get: row => row.player.ehp,
      transform: val => <NumberLabel value={Math.round(val)} />
    },
    {
      key: 'ehb',
      label: 'EHB',
      get: row => row.player.ehb,
      transform: val => <NumberLabel value={Math.round(val)} />
    },
    {
      key: 'updatedAt',
      label: 'Last updated',
      get: row => row.player.updatedAt,
      transform: val => `${durationBetween(val, new Date(), 2, true)} ago`
    }
  ]
};

function MembersTable() {
  const { context } = useContext(GroupContext);
  const { id } = context;

  const group = useSelector(groupSelectors.getGroup(id));

  if (!group || !group.memberships) {
    return <TablePlaceholder size={10} />;
  }

  return (
    <Table
      rows={group.memberships}
      columns={TABLE_CONFIG.columns}
      uniqueKeySelector={TABLE_CONFIG.uniqueKeySelector}
    />
  );
}

export default MembersTable;
