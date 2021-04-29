import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { isSkill } from 'utils';
import { Table, NumberLabel, TablePlaceholder } from 'components';
import { competitionSelectors } from 'redux/competitions';
import { playerSelectors } from 'redux/players';
import { TeamPlayersTable } from '../components';

function TeamsTable({ competition, onUpdateClicked, onExportTeamsClicked, onExportTeamClicked }) {
  const isLoading = useSelector(competitionSelectors.isFetchingDetails);
  const updatingUsernames = useSelector(playerSelectors.getUpdatingUsernames);

  const [expandedTeam, setExpandedTeam] = useState(null);

  function toggleExpandedTeam(teamName) {
    setExpandedTeam(expandedTeam === teamName ? null : teamName);
  }

  if (isLoading) {
    return <TablePlaceholder size={5} />;
  }

  const tableConfig = {
    uniqueKeySelector: row => row.name,
    columns: [
      {
        key: 'rank',
        width: 70,
        className: () => '-break-small'
      },
      {
        key: 'name',
        className: () => '-primary'
      },
      {
        key: 'playersCount',
        label: 'Players',
        className: () => '-break-small',
        get: row => row.participants.length
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
        key: 'avgGained',
        label: 'Avg. Gained',
        className: () => '-break-small',
        transform: val => {
          const lowThreshold = isSkill(competition.metric) ? 10000 : 5;
          return <NumberLabel value={Math.floor(val)} lowThreshold={lowThreshold} isColored isSigned />;
        }
      },
      {
        key: 'MVP',
        className: () => '-break-small',
        get: ({ participants }) => {
          if (!participants || participants.length === 0) return 'None';
          if (participants[0].progress.gained === 0) return 'None';

          return participants[0].displayName;
        }
      },
      {
        key: 'toggleDetails',
        label: '',
        width: 30,
        isSortable: false,
        transform: (value, row) => (
          <button
            type="button"
            onClick={() => toggleExpandedTeam(row.name)}
            className="table-toggle-btn"
            style={{ transform: `rotate(${expandedTeam === row.name ? -90 : 90}deg)` }}
          >
            <img src="/img/icons/arrow_right.svg" alt=">" />
          </button>
        )
      }
    ]
  };

  return (
    <Table
      rows={competition.teams}
      columns={tableConfig.columns}
      uniqueKeySelector={tableConfig.uniqueKeySelector}
      highlightedRowKey={expandedTeam}
      renderRowDetails={row => (
        <AnimatePresence initial={false}>
          {expandedTeam === row.name && (
            <motion.section
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: 'auto' },
                collapsed: { opacity: 0, height: 0 }
              }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
              <div style={{ marginTop: 5, marginBottom: 20 }}>
                <TeamPlayersTable
                  competition={competition}
                  team={row}
                  updatingUsernames={updatingUsernames}
                  onUpdateClicked={onUpdateClicked}
                  onExportClicked={() => onExportTeamClicked(row.name)}
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      )}
      listStyle
      listStyleHeaders
      showToolbar
      onExportClicked={onExportTeamsClicked}
    />
  );
}

TeamsTable.propTypes = {
  competition: PropTypes.shape({
    metric: PropTypes.string,
    status: PropTypes.string,
    teams: PropTypes.arrayOf(PropTypes.shape())
  }).isRequired,
  onUpdateClicked: PropTypes.func.isRequired,
  onExportTeamsClicked: PropTypes.func.isRequired,
  onExportTeamClicked: PropTypes.func.isRequired
};

export default TeamsTable;
