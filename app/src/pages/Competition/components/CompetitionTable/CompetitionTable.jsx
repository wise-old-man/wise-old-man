import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { durationBetween, getMinimumBossKc, getMetricName, isBoss, isSkill } from '../../../../utils';
import Table from '../../../../components/Table';
import PlayerTag from '../../../../components/PlayerTag';
import NumberLabel from '../../../../components/NumberLabel';
import TextLabel from '../../../../components/TextLabel';
import TablePlaceholder from '../../../../components/TablePlaceholder';

function TableUpdateButton({ username, isUpdating, onUpdate }) {
  const btnClass = classNames({ 'update-btn': true, '-loading': isUpdating });
  const onClick = useCallback(() => onUpdate(username), [username, onUpdate]);

  return (
    <button className={btnClass} type="button" onClick={onClick}>
      <img src="/img/icons/sync.svg" alt="" />
    </button>
  );
}

function CompetitionTable({ competition, updatingUsernames, onUpdateClicked, isLoading }) {
  const isFinished = competition.endsAt < new Date();

  const TABLE_CONFIG = {
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
        transform: val => {
          const lowThreshold = isSkill(competition.metric) ? 10000 : 5;
          return <NumberLabel value={val} lowThreshold={lowThreshold} isColored isSigned />;
        },
        get: row => (row.progress ? row.progress.gained : 0)
      },
      {
        key: 'updatedAt',
        label: 'Last updated',
        className: () => '-break-small',
        transform: value => `${durationBetween(value, new Date(), 2, true)} ago`
      },
      {
        key: 'update',
        label: '',
        isSortable: false,
        transform: (value, row) =>
          !isFinished && (
            <TableUpdateButton
              username={row.username}
              isUpdating={updatingUsernames.includes(row.username)}
              onUpdate={onUpdateClicked}
            />
          )
      }
    ]
  };

  if (isLoading) {
    return <TablePlaceholder size={10} />;
  }

  return (
    <Table
      rows={competition.participants}
      columns={TABLE_CONFIG.columns}
      uniqueKeySelector={TABLE_CONFIG.uniqueKeySelector}
    />
  );
}

TableUpdateButton.propTypes = {
  username: PropTypes.string.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired
};

CompetitionTable.propTypes = {
  competition: PropTypes.shape().isRequired,
  updatingUsernames: PropTypes.arrayOf(PropTypes.string).isRequired,
  onUpdateClicked: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default CompetitionTable;
