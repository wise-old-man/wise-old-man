import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from 'utils/dates';
import Table from '../../../../components/Table';

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

function PlayerNames({ nameChanges }) {
  const adjustedNames = [...nameChanges];

  if (nameChanges.length > 0) {
    // Add initial name row
    adjustedNames.push({ newName: nameChanges[nameChanges.length - 1].oldName });
  }

  return (
    <Table
      uniqueKeySelector={TABLE_CONFIG.uniqueKey}
      rows={adjustedNames}
      columns={TABLE_CONFIG.columns}
      listStyle
    />
  );
}

PlayerNames.defaultProps = {
  nameChanges: []
};

PlayerNames.propTypes = {
  nameChanges: PropTypes.arrayOf()
};

export default PlayerNames;
