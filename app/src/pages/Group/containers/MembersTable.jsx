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
      transform: (_, row) => {
        return row.player.exp === -1 ? (
          <TextLabel value="---" popupValue="Unranked" />
        ) : (
          <NumberLabel value={row.player.exp} />
        );
      }
    },
    {
      key: 'ehp',
      label: 'EHP',
      transform: (_, row) => <NumberLabel value={Math.round(row.player.ehp)} />
    },
    {
      key: 'ehb',
      label: 'EHB',
      transform: (_, row) => <NumberLabel value={Math.round(row.player.ehb)} />
    },
    {
      key: 'updatedAt',
      label: 'Last updated',
      transform: (_, row) => `${durationBetween(row.player.updatedAt, new Date(), 2, true)} ago`
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
