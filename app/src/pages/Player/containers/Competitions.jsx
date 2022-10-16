import React, { useContext, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, TablePlaceholder, StatusDot, Badge } from 'components';
import { durationBetween, getMetricIcon } from 'utils';
import { competitionSelectors, competitionActions } from 'redux/competitions';
import { PlayerContext } from '../context';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'metric',
      width: 30,
      get: row => row.competition.metric,
      transform: value => <img src={getMetricIcon(value)} alt="" />
    },
    {
      key: 'title',
      get: row => row.competition.title,
      className: () => '-primary',
      transform: (val, row) => <Link to={`/competitions/${row.competition.id}`}>{val}</Link>
    },
    {
      key: 'status',
      transform: (_, row) => {
        const now = new Date();
        const { startsAt, endsAt } = row.competition;

        let status = '';
        let countdown = '';

        if (startsAt > now) {
          status = 'upcoming';
          countdown = `Starts in ${durationBetween(now, startsAt, 2)}`;
        } else if (endsAt < now) {
          status = 'finished';
          countdown = `Ended ${durationBetween(endsAt, now, 1)} ago`;
        } else if (startsAt < now && endsAt > now) {
          status = 'ongoing';
          countdown = `Ends in ${durationBetween(now, endsAt, 2)}`;
        }

        return (
          <div className="status-cell">
            <StatusDot status={convertStatus(status)} />
            <span>{countdown}</span>
          </div>
        );
      }
    },
    {
      key: 'participantCount',
      get: row => row.competition.participantCount,
      className: () => '-break-medium',
      transform: val => `${val} participants`
    },
    {
      key: 'duration',
      get: row => durationBetween(row.competition.startsAt, row.competition.endsAt, 3),
      className: () => '-break-large',
      transform: val => `Duration: ${val}`
    },
    {
      key: 'type',
      get: row => row.competition.type,
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
          rows={competitions}
          columns={TABLE_CONFIG.columns}
          listStyle
        />
      )}
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
