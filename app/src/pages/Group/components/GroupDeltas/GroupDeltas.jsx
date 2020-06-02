import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Table from '../../../../components/Table';
import PlayerTag from '../../../../components/PlayerTag';
import NumberLabel from '../../../../components/NumberLabel';
import { durationBetween } from '../../../../utils';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'rank',
      className: () => '-break-small'
    },
    {
      key: 'displayName',
      label: 'Name',
      className: () => '-primary',
      transform: (value, row) => (
        <Link to={`/players/${row.playerId}`}>
          <PlayerTag name={value} type={row.type} />
        </Link>
      )
    },
    {
      key: 'gained',
      transform: val => <NumberLabel value={val} isColored isSigned />
    },
    {
      key: 'percentage',
      label: '%',
      className: () => '-break-small',
      transform: val => <NumberLabel value={Math.round(val * 10000) / 100} isColored isSigned />
    },
    {
      key: 'endDate',
      label: 'Last updated',
      className: () => '-break-small',
      transform: value => `${durationBetween(value, new Date(), 2, true)} ago`
    }
  ]
};
function GroupDeltas({ deltas }) {
  return (
    <Table uniqueKeySelector={TABLE_CONFIG.uniqueKey} rows={deltas} columns={TABLE_CONFIG.columns} />
  );
}

GroupDeltas.defaultProps = {
  deltas: []
};

GroupDeltas.propTypes = {
  deltas: PropTypes.arrayOf(PropTypes.shape)
};

export default GroupDeltas;
