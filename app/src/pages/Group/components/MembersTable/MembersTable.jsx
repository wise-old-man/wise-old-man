import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Table from '../../../../components/Table';
import PlayerTag from '../../../../components/PlayerTag';
import NumberLabel from '../../../../components/NumberLabel';
import TableListPlaceholder from '../../../../components/TableListPlaceholder';
import { durationBetween, capitalize } from '../../../../utils';

function MembersTable({ members, isLoading }) {
  if (!members) {
    return null;
  }

  // Column config
  const columns = [
    {
      key: 'rank',
      width: 70
    },
    {
      key: 'username',
      className: () => '-primary',
      transform: (value, row) => (
        <Link to={`/players/${row.id}`}>
          <PlayerTag username={value} type={row.type} />
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
      className: () => '-break-large',
      transform: value => `${durationBetween(value, new Date(), 2, true)} ago`
    }
  ];

  if (isLoading) {
    return <TableListPlaceholder size={10} />;
  }

  return <Table rows={members} columns={columns} />;
}

MembersTable.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default React.memo(MembersTable);
