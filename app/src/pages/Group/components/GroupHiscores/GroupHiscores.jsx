import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Table from '../../../../components/Table';
import PlayerTag from '../../../../components/PlayerTag';
import NumberLabel from '../../../../components/NumberLabel';
import { isSkill, durationBetween, getMeasure } from '../../../../utils';
import TablePlaceholder from '../../../../components/TablePlaceholder';

function getTableConfig(metric) {
  const TABLE_CONFIG = {
    uniqueKey: row => row.id,
    columns: [
      {
        key: 'groupRank',
        label: 'Rank',
        className: () => '-break-small'
      },
      {
        key: 'displayName',
        label: 'Name',
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={`/players/${row.id}`}>
            <PlayerTag name={value} type={row.type} />
          </Link>
        )
      },
      {
        key: getMeasure(metric),
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

  if (isSkill(metric)) {
    TABLE_CONFIG.columns.splice(3, 0, {
      key: 'level'
    });
  }

  return TABLE_CONFIG;
}

function GroupHiscores({ hiscores, metric, isLoading }) {
  const { uniqueKey, columns } = useMemo(() => getTableConfig(metric), [hiscores, metric]);

  return isLoading ? (
    <TablePlaceholder size={20} />
  ) : (
    <Table uniqueKeySelector={uniqueKey} rows={hiscores} columns={columns} />
  );
}

GroupHiscores.defaultProps = {
  hiscores: []
};

GroupHiscores.propTypes = {
  hiscores: PropTypes.arrayOf(PropTypes.shape),
  metric: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default GroupHiscores;
