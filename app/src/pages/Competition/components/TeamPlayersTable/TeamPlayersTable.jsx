import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { durationBetween, getMinimumBossKc, getMetricName, isBoss, isSkill, isActivity } from 'utils';
import URL from 'utils/url';
import { SKILLS } from 'config';
import { Table, PlayerTag, NumberLabel } from 'components';

function TeamPlayersTable({
  competition,
  metric,
  updatingUsernames,
  team,
  onUpdateClicked,
  onExportClicked
}) {
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
          <Link to={getPlayerRedirectURL(row, competition, metric)}>
            <PlayerTag name={value} type={row.type} flagged={row.flagged} country={row.country} />
          </Link>
        )
      },
      {
        key: 'start',
        get: row => (row.progress ? row.progress.start : 0),
        transform: (val, row) => {
          const lastUpdated = row.updatedAt;
          const minKc = getMinimumBossKc(metric);
          const metricName = getMetricName(metric);

          // If competition hasn't started
          if (competition.startsAt >= Date.now())
            return (
              <abbr title={"This competition hasn't started yet."}>
                <span>--</span>
              </abbr>
            );

          // If player is outdated
          if (!lastUpdated || lastUpdated < competition.startsAt)
            return (
              <abbr title={"This player hasn't been updated since the competition started."}>
                <span>--</span>
              </abbr>
            );

          // If is unranked on a boss metric
          if (isBoss(metric) && val < minKc)
            return (
              <abbr title={`The Hiscores only start tracking ${metricName} kills after ${minKc} kc.`}>
                <span>{`< ${minKc}`}</span>
              </abbr>
            );

          // If unranked or not updated
          if (val === -1)
            return (
              <abbr title={`This player is currently unranked in ${metricName}.`}>
                <span>--</span>
              </abbr>
            );

          return <NumberLabel value={val} />;
        }
      },
      {
        key: 'end',
        get: row => (row.progress ? row.progress.end : 0),
        transform: (val, row) => {
          const lastUpdated = row.updatedAt;
          const minKc = getMinimumBossKc(metric);
          const metricName = getMetricName(metric);

          // If competition hasn't started
          if (competition.startsAt >= Date.now())
            return (
              <abbr title={"This competition hasn't started yet."}>
                <span>--</span>
              </abbr>
            );

          // If player is outdated
          if (!lastUpdated || lastUpdated < competition.startsAt)
            return (
              <abbr title={"This player hasn't been updated since the competition started."}>
                <span>--</span>
              </abbr>
            );

          // If is unranked on a boss metric
          if (isBoss(metric) && val < minKc)
            return (
              <abbr title={`The Hiscores only start tracking ${metricName} kills after ${minKc} kc.`}>
                <span>{`< ${minKc}`}</span>
              </abbr>
            );

          // If unranked or not updated
          if (val === -1)
            return (
              <abbr title={`This player is currently unranked in ${metricName}.`}>
                <span>--</span>
              </abbr>
            );

          return <NumberLabel value={val} />;
        }
      },
      {
        key: 'gained',
        get: row => (row.progress ? row.progress.gained : 0),
        transform: val => {
          const lowThreshold = isSkill(metric) ? 10000 : 5;
          return <NumberLabel value={val} lowThreshold={lowThreshold} isColored isSigned />;
        }
      },
      {
        key: 'updatedAt',
        label: 'Last updated',
        className: value => {
          // If competition has started and this player hasn't updated since, show red text
          if (competition.startsAt < Date.now() && (!value || value < competition.startsAt)) {
            return '-negative';
          }

          return '';
        },
        transform: value => `${durationBetween(value, new Date(), 1, true)} ago`
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

  if (SKILLS.filter(s => s !== 'overall').includes(metric)) {
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
      rows={team.participants}
      columns={tableConfig.columns}
      uniqueKeySelector={tableConfig.uniqueKeySelector}
      showToolbar
      onExportClicked={onExportClicked}
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

function getPlayerRedirectURL(player, competition, metric) {
  const { displayName } = player;

  let metricType = 'skilling';
  if (isBoss(metric) || metric === 'ehb') metricType = 'bossing';
  if (isActivity(metric)) metricType = 'activities';

  const nextURL = new URL(`/players`);
  nextURL.appendToPath(`/${displayName.replace(' ', '_')}`);
  nextURL.appendToPath('/gained');
  nextURL.appendToPath(`/${metricType}`);

  nextURL.appendSearchParam('metric', metric);
  nextURL.appendSearchParam('period', 'custom');
  nextURL.appendSearchParam('startDate', competition.startsAt.toISOString());
  nextURL.appendSearchParam('endDate', competition.endsAt.toISOString());

  return nextURL.getPath();
}

TeamPlayersTable.defaultProps = {
  updatingUsernames: []
};

TeamPlayersTable.propTypes = {
  metric: PropTypes.string.isRequired,
  competition: PropTypes.shape({
    metric: PropTypes.string,
    status: PropTypes.string,
    startsAt: PropTypes.instanceOf(Date)
  }).isRequired,
  team: PropTypes.shape({
    participants: PropTypes.arrayOf(PropTypes.shape({}))
  }).isRequired,
  updatingUsernames: PropTypes.arrayOf(PropTypes.string),
  onUpdateClicked: PropTypes.func.isRequired,
  onExportClicked: PropTypes.func.isRequired
};

TableUpdateButton.propTypes = {
  username: PropTypes.string.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default TeamPlayersTable;
