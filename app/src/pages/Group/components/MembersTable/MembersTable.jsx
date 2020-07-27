import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Table from '../../../../components/Table';
import PlayerTag from '../../../../components/PlayerTag';
import NumberLabel from '../../../../components/NumberLabel';
import TablePlaceholder from '../../../../components/TablePlaceholder';
import { durationBetween, capitalize } from '../../../../utils';

function MembersTable({ members, isLoading }) {
  if (!members) {
    return null;
  }

  const TABLE_CONFIG = {
    uniqueKeySelector: row => row.username,
    columns: [
      {
        key: 'rank',
        width: 70
      },
      {
        key: 'displayName',
        label: 'Name',
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={`/players/${row.id}`}>
            <PlayerTag name={value} type={row.type} flagged={row.flagged} />
          </Link>
        )
      },
      {
        key: 'role',
        transform: value => capitalize(value)
      },
      {
        key: 'overallExperience',
        label: 'Overall exp.',
        className: () => '-break-small',
        transform: val => <NumberLabel value={val} />
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
