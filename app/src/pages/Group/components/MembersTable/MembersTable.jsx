import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, PlayerTag, NumberLabel, TablePlaceholder } from 'components';
import { durationBetween, capitalize } from 'utils';

function MembersTable({ members, isLoading }) {
  if (!members) {
    return null;
  }

  const TABLE_CONFIG = {
    uniqueKeySelector: row => row.username,
    columns: [
      {
        key: 'displayName',
        label: 'Name',
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={`/players/${row.username}`}>
            <PlayerTag name={value} type={row.type} flagged={row.flagged} />
          </Link>
        )
      },
      {
        key: 'role',
        transform: value => capitalize(value)
      },
      {
        key: 'exp',
        label: 'Exp.',
        className: () => '-break-small',
        transform: val => <NumberLabel value={val} />
      },
      {
        key: 'ehp',
        label: 'EHP',
        className: () => '-break-small',
        transform: val => <NumberLabel value={Math.round(val)} />
      },
      {
        key: 'ehb',
        label: 'EHB',
        className: () => '-break-small',
        transform: val => <NumberLabel value={Math.round(val)} />
      },
      {
        key: 'updatedAt',
        label: 'Last updated',
        className: () => '-break-small',
        transform: value => `${durationBetween(value, new Date(), 2, true)} ago`
      }
    ]
  };

  if (isLoading) {
    return <TablePlaceholder size={10} />;
  }

  return (
    <Table
      rows={members}
      columns={TABLE_CONFIG.columns}
      uniqueKeySelector={TABLE_CONFIG.uniqueKeySelector}
    />
  );
}

MembersTable.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default React.memo(MembersTable);
