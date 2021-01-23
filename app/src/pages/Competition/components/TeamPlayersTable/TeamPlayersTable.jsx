import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { durationBetween, getMinimumBossKc, getMetricName, isBoss, isSkill } from 'utils';
import { Table, PlayerTag, NumberLabel, TextLabel } from 'components';

function TeamPlayersTable({ competition, updatingUsernames, team, onUpdateClicked }) {
  const tableConfig = {
    uniqueKeySelector: row => row.username,
    columns: [
      {
        key: 'teamRank',
        label: 'Rank',
        width: 70
      },
      {
        key: 'displayName',
        label: 'Name',
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={`/players/${row.username}`}>
            <PlayerTag name={value} type={row.type} flagged={row.flagged} country={row.country} />
          </Link>
        )
      },
      {
        key: 'start',
        get: row => (row.progress ? row.progress.start : 0),
        className: () => '-break-small',
        transform: val => {
          const minKc = getMinimumBossKc(competition.metric);
          const metricName = getMetricName(competition.metric);

          if (val !== -1) return <NumberLabel value={val} />;
          if (!isBoss(competition.metric)) return val;

          return (
            <TextLabel
              value={`< ${minKc}`}
              popupValue={`The Hiscores only start tracking ${metricName} kills after ${minKc} kc`}
            />
          );
        }
      },
      {
        key: 'end',
        get: row => (row.progress ? row.progress.end : 0),
        className: () => '-break-small',
        transform: val => {
          const minKc = getMinimumBossKc(competition.metric);
          const metricName = getMetricName(competition.metric);

          if (val !== -1) return <NumberLabel value={val} />;
          if (!isBoss(competition.metric)) return val;

          return (
            <TextLabel
              value={`< ${minKc}`}
              popupValue={`The Hiscores only start tracking ${metricName} kills after ${minKc} kc`}
            />
          );
        }
      },
      {
        key: 'gained',
        get: row => (row.progress ? row.progress.gained : 0),
        transform: val => {
          const lowThreshold = isSkill(competition.metric) ? 10000 : 5;
          return <NumberLabel value={val} lowThreshold={lowThreshold} isColored isSigned />;
        }
      },
      {
        key: 'updatedAt',
        label: 'Last updated',
        className: () => '-break-large',
        transform: value => `${durationBetween(value, new Date(), 2, true)} ago`
      },
      {
        key: 'update',
        label: '',
        isSortable: false,
        width: 50,
        transform: (value, row) =>
          competition.status !== 'finished' && (
            <TableUpdateButton
              username={row.username}
              isUpdating={updatingUsernames.includes(row.username)}
              onUpdate={onUpdateClicked}
            />
          )
      }
    ]
  };

  return (
    <Table
      rows={team.participants}
      columns={tableConfig.columns}
      uniqueKeySelector={tableConfig.uniqueKeySelector}
    />
  );
}

function TableUpdateButton({ username, isUpdating, onUpdate }) {
  const btnClass = classNames({ 'update-btn': true, '-loading': isUpdating });
  const onClick = useCallback(() => onUpdate(username), [username, onUpdate]);

  return (
    <button className={btnClass} type="button" onClick={onClick}>
      <img src="/img/icons/sync.svg" alt="" />
    </button>
  );
}

TeamPlayersTable.defaultProps = {
  updatingUsernames: []
};

TeamPlayersTable.propTypes = {
  competition: PropTypes.shape({
    metric: PropTypes.string,
    status: PropTypes.string
  }).isRequired,
  team: PropTypes.shape({
    participants: PropTypes.arrayOf(PropTypes.shape({}))
  }).isRequired,
  updatingUsernames: PropTypes.arrayOf(PropTypes.string),
  onUpdateClicked: PropTypes.func.isRequired
};

TableUpdateButton.propTypes = {
  username: PropTypes.string.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default TeamPlayersTable;
