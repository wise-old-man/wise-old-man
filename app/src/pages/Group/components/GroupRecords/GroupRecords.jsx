import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Table from '../../../../components/Table';
import TablePlaceholder from '../../../../components/TablePlaceholder';
import PlayerTag from '../../../../components/PlayerTag';
import NumberLabel from '../../../../components/NumberLabel';
import { formatDate } from '../../../../utils';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'rank'
    },
    {
      key: 'displayName',
      label: 'Name',
      className: () => '-primary',
      transform: (value, row) => (
        <Link to={`/players/${row.playerId}`}>
          <PlayerTag name={row.player.displayName} type={row.player.type} flagged={row.player.flagged} />
        </Link>
      )
    },
    {
      key: 'value',
      transform: val => <NumberLabel value={val} isColored isSigned />
    },
    {
      key: 'updatedAt',
      label: 'Date',
      className: () => '-break-small',
      transform: (value, row) => formatDate(row.updatedAt, 'DD MMM, YYYY')
    }
  ]
};
function GroupRecords({ records, isLoading }) {
  return isLoading ? (
    <TablePlaceholder size={20} />
  ) : (
    <Table uniqueKeySelector={TABLE_CONFIG.uniqueKey} rows={records} columns={TABLE_CONFIG.columns} />
  );
}

GroupRecords.defaultProps = {
  records: []
};

GroupRecords.propTypes = {
  records: PropTypes.arrayOf(PropTypes.shape),
  isLoading: PropTypes.bool.isRequired
};

export default GroupRecords;
