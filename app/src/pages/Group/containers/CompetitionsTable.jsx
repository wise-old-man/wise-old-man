import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { competitionSelectors } from 'redux/competitions';
import { sortBy, indexOf } from 'lodash';
import { Table, StatusDot, Badge } from 'components';
import { getMetricIcon } from 'utils';
import { GroupContext } from '../context';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'metric',
      width: 30,
      transform: value => <img src={getMetricIcon(value)} alt="" />
    },
    { key: 'title', className: () => '-primary' },
    {
      key: 'status',
      className: () => '-break-small',
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
      className: () => '-break-small',
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

function CompetitionsTable({ handleRedirect }) {
  const { context } = useContext(GroupContext);
  const { id } = context;

  const competitions = useSelector(competitionSelectors.getGroupCompetitions(id));

  const order = ['ongoing', 'upcoming', 'finished'];
  const rows = competitions ? sortBy(competitions, c => indexOf(order, c.status)) : [];

  const handleRowClicked = index => {
    handleRedirect(`/competitions/${rows[index].id}`);
  };

  return (
    <Table
      uniqueKeySelector={TABLE_CONFIG.uniqueKey}
      rows={rows}
      columns={TABLE_CONFIG.columns}
      onRowClicked={handleRowClicked}
      clickable
      listStyle
    />
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

CompetitionsTable.propTypes = {
  handleRedirect: PropTypes.func.isRequired
};

export default CompetitionsTable;
