import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Table from '../../../../components/Table';
import PlayerTag from '../../../../components/PlayerTag';
import NumberLabel from '../../../../components/NumberLabel';
import { isSkill, getLevel, getMeasure } from '../../../../utils';

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
      }
    ]
  };

  // Oops, there's no way to get the overall level from the exp,
  // we need to change the API to get the levels from there instead
  if (isSkill(metric) && metric !== 'overall') {
    TABLE_CONFIG.columns.push({
      key: 'virtualLevel',
      label: 'Virtual Level',
      get: row => getLevel(row.experience, true)
    });
  }

  return TABLE_CONFIG;
}

function GroupHiscores({ hiscores, metric }) {
  const { uniqueKey, columns } = useMemo(() => getTableConfig(metric), [hiscores, metric]);

  return <Table uniqueKeySelector={uniqueKey} rows={hiscores} columns={columns} />;
}

GroupHiscores.defaultProps = {
  hiscores: []
};

GroupHiscores.propTypes = {
  hiscores: PropTypes.arrayOf(PropTypes.shape),
  metric: PropTypes.string.isRequired
};

export default GroupHiscores;
