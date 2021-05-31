import React, { useContext, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, TablePlaceholder, StatusDot, Badge } from 'components';
import { getMetricIcon } from 'utils';
import { competitionSelectors, competitionActions } from 'redux/competitions';
import { PlayerContext } from '../context';

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
      key: 'duration',
      className: () => '-break-large',
      transform: val => `Duration: ${val}`
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

function Competitions() {
  const dispatch = useDispatch();
  const { context } = useContext(PlayerContext);

  const { username } = context;

  const isLoading = useSelector(competitionSelectors.isFetchingList);
  const competitions = useSelector(competitionSelectors.getPlayerCompetitions(username));

  const rows = sortCompetitions(competitions);

  const fetchCompetitions = useCallback(() => {
    // Fetch player competitions, if not loaded yet
    if (!competitions) {
      dispatch(competitionActions.fetchPlayerCompetitions(username));
    }
  }, [dispatch, username, competitions]);

  useEffect(fetchCompetitions, [fetchCompetitions]);

  return (
    <div className="col">
      {isLoading ? (
        <TablePlaceholder size={3} />
      ) : (
        <Table
          uniqueKeySelector={TABLE_CONFIG.uniqueKey}
          rows={rows}
          columns={TABLE_CONFIG.columns}
          listStyle
        />
      )}
    </div>
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

export default Competitions;
