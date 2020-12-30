import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { isSkill } from 'utils';
import { Table, NumberLabel, TablePlaceholder } from 'components';
import { competitionSelectors } from 'redux/competitions';

function TeamsTable({ competition }) {
  const isLoading = useSelector(competitionSelectors.isFetchingDetails);

  if (isLoading) {
    return <TablePlaceholder size={5} />;
  }

  const tableConfig = {
    uniqueKeySelector: row => row.name,
    columns: [
      {
        key: 'rank',
        width: 70
      },
      {
        key: 'name',
        className: () => '-primary'
      },
      {
        key: 'playersCount',
        label: 'Players',
        get: row => row.participants.length
      },
      {
        key: 'avgGained',
        label: 'Avg. Gained',
        transform: val => {
          const lowThreshold = isSkill(competition.metric) ? 10000 : 5;
          return <NumberLabel value={val} lowThreshold={lowThreshold} isColored isSigned />;
        }
      },
      {
        key: 'totalGained',
        label: 'Total Gained',
        transform: val => {
          const lowThreshold = isSkill(competition.metric) ? 30000 : 10;
          return <NumberLabel value={val} lowThreshold={lowThreshold} isColored isSigned />;
        }
      },
      {
        key: 'MVP',
        get: ({ participants }) => {
          if (!participants || participants.length === 0) return 'None';
          if (participants[0].progress.gained === 0) return 'none';

          return participants[0].displayName;
        }
      }
    ]
  };

  return (
    <Table
      rows={competition.teams}
      columns={tableConfig.columns}
      uniqueKeySelector={tableConfig.uniqueKeySelector}
      listStyle
      listStyleHeaders
    />
  );
}

TeamsTable.propTypes = {
  competition: PropTypes.shape({
    metric: PropTypes.string,
    status: PropTypes.string,
    teams: PropTypes.arrayOf(PropTypes.shape())
  }).isRequired
};

export default TeamsTable;
