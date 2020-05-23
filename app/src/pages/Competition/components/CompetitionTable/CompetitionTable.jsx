import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { durationBetween } from '../../../../utils';
import Table from '../../../../components/Table';
import PlayerTag from '../../../../components/PlayerTag';
import NumberLabel from '../../../../components/NumberLabel';
import TableListPlaceholder from '../../../../components/TableListPlaceholder';

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
        transform: val => <NumberLabel value={val} />,
        className: () => '-break-large',
        get: row => (row.progress ? row.progress.start : 0)
      },
      {
        key: 'end',
        transform: val => <NumberLabel value={val} />,
        className: () => '-break-large',
        get: row => (row.progress ? row.progress.end : 0)
      },
      {
        key: 'gained',
        transform: val => <NumberLabel value={val} lowThreshold={10000} isColored isSigned />,
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
    return <TableListPlaceholder size={10} />;
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
