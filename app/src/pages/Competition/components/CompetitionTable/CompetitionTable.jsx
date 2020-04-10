import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { durationBetween, formatNumber } from '../../../../utils';
import Table from '../../../../components/Table';
import PlayerTag from '../../../../components/PlayerTag';

function transformNumber(value) {
  const formattedValue = formatNumber(value, true);
  return value > 0 ? `+${formattedValue}` : formattedValue;
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

function CompetitionTable({ competition, updatingUsernames, onUpdateClicked }) {
  const isFinished = competition.endsAt < new Date();

  // Column config
  const columns = [
    { key: 'rank', width: 30 },
    {
      key: 'username',
      className: () => '-primary',
      transform: (value, row) => (
        <Link to={`/players/${row.id}`}>
          <PlayerTag username={value} type={row.type} />
        </Link>
      )
    },
    {
      key: 'start',
      transform: val => formatNumber(val, true),
      className: () => '-break-large',
      get: row => (row.progress ? row.progress.start : 0)
    },
    {
      key: 'end',
      transform: val => formatNumber(val, true),
      className: () => '-break-large',
      get: row => (row.progress ? row.progress.end : 0)
    },
    {
      key: 'gained',
      transform: transformNumber,
      get: row => (row.progress ? row.progress.delta : 0),
      className: value => (value > 0 ? '-positive' : '')
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
      transform: (value, row) =>
        !isFinished && (
          <TableUpdateButton
            username={row.username}
            isUpdating={updatingUsernames.includes(row.username)}
            onUpdate={onUpdateClicked}
          />
        )
    }
  ];

  return <Table rows={competition.participants} columns={columns} />;
}

TableUpdateButton.propTypes = {
  username: PropTypes.string.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired
};

CompetitionTable.propTypes = {
  competition: PropTypes.shape().isRequired,
  updatingUsernames: PropTypes.arrayOf(PropTypes.string).isRequired,
  onUpdateClicked: PropTypes.func.isRequired
};

export default CompetitionTable;
