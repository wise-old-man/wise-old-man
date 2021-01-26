import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { SKILLS } from 'config';
import { durationBetween, getMinimumBossKc, getMetricName, isBoss, isSkill } from 'utils';
import { Table, PlayerTag, NumberLabel, TextLabel, TablePlaceholder } from 'components';
import { competitionSelectors } from 'redux/competitions';
import { playerSelectors } from 'redux/players';

function ParticipantsTable({ competition, onUpdateClicked }) {
  const isLoading = useSelector(competitionSelectors.isFetchingDetails);
  const updatingUsernames = useSelector(playerSelectors.getUpdatingUsernames);

  if (isLoading) {
    return <TablePlaceholder size={10} />;
  }

  const tableConfig = {
    uniqueKeySelector: row => row.username,
    columns: [
      {
        key: 'rank',
        width: 70
      },
      {
        key: 'displayName',
        label: 'Name',
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={`/players/${row.username}`}>
            <PlayerTag name={value} type={row.type} flagged={row.flagged} />
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
        className: () => '-break-small',
        transform: value => `${durationBetween(value, new Date(), 1, true)} ago`
      },
      {
        key: 'update',
        label: '',
        isSortable: false,
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

  if (competition.type === 'team') {
    tableConfig.columns.splice(2, 0, {
      key: 'teamName',
      label: 'Team'
    });
  }

  if (SKILLS.filter(s => s !== 'overall').includes(competition.metric)) {
    tableConfig.columns.splice(tableConfig.columns.length - 2, 0, {
      key: 'levels',
      get: row => (row.levelsGained ? row.levelsGained : 0),
      transform: val => {
        return <NumberLabel value={val} isColored isSigned />;
      }
    });
  }

  return (
    <Table
      rows={competition.participants}
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

ParticipantsTable.propTypes = {
  competition: PropTypes.shape({
    type: PropTypes.string,
    metric: PropTypes.string,
    status: PropTypes.string,
    participants: PropTypes.arrayOf(PropTypes.shape({}))
  }).isRequired,
  onUpdateClicked: PropTypes.func.isRequired
};

TableUpdateButton.propTypes = {
  username: PropTypes.string.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ParticipantsTable;
