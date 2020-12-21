import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { sortBy, indexOf } from 'lodash';
import { Table, StatusDot } from 'components';
import { getMetricIcon } from 'utils';
import { competitionSelectors } from 'redux/competitions';
import { PlayerContext } from '../context';

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

function Competitions() {
  const { context } = useContext(PlayerContext);
  const { username } = context;
  const competitions = useSelector(state => competitionSelectors.getPlayerCompetitions(state, username));

  const order = ['ongoing', 'upcoming', 'finished'];
  const rows = competitions ? sortBy(competitions, c => indexOf(order, c.status)) : [];

  return (
    <div className="col">
      <Table
        uniqueKeySelector={TABLE_CONFIG.uniqueKey}
        rows={rows}
        columns={TABLE_CONFIG.columns}
        listStyle
      />
    </div>
  );
}

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

export default Competitions;
