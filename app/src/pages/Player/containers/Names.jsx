import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { formatDate } from 'utils/dates';
import { Table } from 'components';
import { nameSelectors } from 'redux/names';
import { PlayerContext } from '../context';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'newName',
      className: () => '-primary'
    },
    {
      key: 'createdAt',
      className: () => '-break-large',
      transform: value => {
        if (!value) return 'Initial Name';
        return `Submitted at ${formatDate(value, 'DD MMM YYYY')}`;
      }
    },
    {
      key: 'resolvedAt',
      transform: value => {
        if (!value) return '---';
        return `Approved at ${formatDate(value, 'DD MMM YYYY')}`;
      }
    }
  ]
};

function Names() {
  const { context } = useContext(PlayerContext);
  const { username } = context;

  const nameChanges = useSelector(state => nameSelectors.getPlayerNames(state, username));
  const adjustedNames = [...nameChanges];

  if (nameChanges.length > 0) {
    // Add initial name row
    adjustedNames.push({ newName: nameChanges[nameChanges.length - 1].oldName });
  }

  return (
    <div className="col">
      <Table
        uniqueKeySelector={TABLE_CONFIG.uniqueKey}
        rows={adjustedNames}
        columns={TABLE_CONFIG.columns}
        listStyle
      />
    </div>
  );
}

export default Names;
