import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import Table from '../../../../components/Table';
import StatusDot from '../../../../components/StatusDot';
import { getMetricIcon } from '../../../../utils';

function convertStatus(status) {
  switch (status) {
    case 'upcoming':
      return 'NEUTRAL';
    case 'ongoing':
      return 'POSITIVE';
    case 'finished':
      return 'NEGATIVE';
    default:
      return null;
  }
}

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'metric',
      width: 30,
      transform: value => <img src={getMetricIcon(value)} alt="" />
    },
    {
      key: 'title',
      className: () => '-primary',
      transform: (val, row) => <Link to={`/competitions/${row.id}`}>{val}</Link>
    },
    {
      key: 'status',
      className: () => '-break-small',
      transform: (value, row) => (
        <div className="status-cell">
          <StatusDot status={convertStatus(value)} />
          <span>{row && row.countdown}</span>
        </div>
      )
    },
    {
      key: 'participantCount',
      className: () => '-break-medium',
      transform: val => `${val} participants`
    },
    {
      key: 'duration',
      className: () => '-break-large',
      transform: val => `Lasts for ${val}`
    }
  ]
};

function PlayerCompetitionsTable({ competitions }) {
  const order = ['ongoing', 'upcoming', 'finished'];
  const rows = competitions ? _.sortBy(competitions, c => _.indexOf(order, c.status)) : [];

  return (
    <Table
      uniqueKeySelector={TABLE_CONFIG.uniqueKey}
      rows={rows}
      columns={TABLE_CONFIG.columns}
      listStyle
    />
  );
}

PlayerCompetitionsTable.propTypes = {
  competitions: PropTypes.arrayOf(PropTypes.shape).isRequired
};

export default React.memo(PlayerCompetitionsTable);
