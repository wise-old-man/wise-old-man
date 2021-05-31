import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { competitionSelectors } from 'redux/competitions';
import { Table, StatusDot, Badge } from 'components';
import { getMetricIcon } from 'utils';
import { GroupContext } from '../context';

const STATUS_ORDER = ['ongoing', 'upcoming', 'finished'];

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
      key: 'type',
      transform: value => {
        return (
          value === 'team' && (
            <Badge
              text="Teams"
              hoverText="Team competition: Players are divided into competing teams."
              color="#898989"
            />
          )
        );
      }
    }
  ]
};

function CompetitionsTable() {
  const { context } = useContext(GroupContext);
  const { id } = context;

  const competitions = useSelector(competitionSelectors.getGroupCompetitions(id));
  const rows = sortCompetitions(competitions);

  return (
    <Table
      uniqueKeySelector={TABLE_CONFIG.uniqueKey}
      rows={rows}
      columns={TABLE_CONFIG.columns}
      clickable
      listStyle
    />
  );
}

function sortCompetitions(competitions) {
  if (!competitions) return [];

  return competitions.sort((a, b) => {
    return (
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
      a.startsAt.getTime() - b.startsAt.getTime() ||
      a.endsAt.getTime() - b.endsAt.getTime()
    );
  });
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

export default CompetitionsTable;
