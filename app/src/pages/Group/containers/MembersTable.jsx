import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { groupSelectors } from 'redux/groups';
import { Link } from 'react-router-dom';
import { Table, PlayerTag, NumberLabel, TextLabel, RoleTag, TablePlaceholder } from 'components';
import { durationBetween } from 'utils';
import { GroupContext } from '../context';

const TABLE_CONFIG = {
  uniqueKeySelector: row => row.username,
  columns: [
    {
      key: 'displayName',
      label: 'Name',
      className: () => '-primary',
      transform: (value, row) => (
        <Link to={`/players/${row.username}`}>
          <PlayerTag name={value} type={row.type} flagged={row.flagged} country={row.country} />
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
      transform: val => <NumberLabel value={Math.round(val)} />
    },
    {
      key: 'ehb',
      label: 'EHB',
      transform: val => <NumberLabel value={Math.round(val)} />
    },
    {
      key: 'updatedAt',
      label: 'Last updated',
      transform: value => `${durationBetween(value, new Date(), 2, true)} ago`
    }
  ]
};

function MembersTable() {
  const { context } = useContext(GroupContext);
  const { id } = context;

  const group = useSelector(groupSelectors.getGroup(id));
  const isLoadingMembers = useSelector(groupSelectors.isFetchingMembers);

  if (!group || !group.members) {
    return null;
  }

  if (isLoadingMembers) {
    return <TablePlaceholder size={10} />;
  }

  return (
    <Table
      rows={group.members}
      columns={TABLE_CONFIG.columns}
      uniqueKeySelector={TABLE_CONFIG.uniqueKeySelector}
    />
  );
}

export default MembersTable;
