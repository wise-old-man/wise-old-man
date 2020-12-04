import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { recordActions, recordSelectors } from 'redux/records';
import { Table, PageTitle, Selector, PlayerTag, NumberLabel, TablePlaceholder } from 'components';
import { PLAYER_TYPES, PLAYER_BUILDS, ALL_METRICS } from 'config';
import { useQuery } from 'hooks';
import {
  formatDate,
  getPlayerIcon,
  getPlayerBuild,
  getMetricIcon,
  capitalize,
  getMetricName,
  isSkill,
  isBoss
} from 'utils';
import './Records.scss';

function getTableConfig(metric) {
  return {
    uniqueKey: row => row.player.username,
    columns: [
      {
        key: 'rank',
        width: '10',
        transform: rank => <span className="record-rank">{rank}</span>
      },
      {
        key: 'displayName',
        get: row => row.player.displayName,
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={getPlayerURL(row.player.username, metric)}>
            <PlayerTag name={value} type={row.player.type} flagged={row.player.flagged} />
          </Link>
        )
      },
      {
        key: 'updatedAt',
        className: () => '-break-small',
        transform: value => (
          <abbr title={formatDate(value, 'Do MMM YYYY HH:mm')}>
            <span className="record-date">{formatDate(value, "DD MMM 'YY")}</span>
          </abbr>
        )
      },
      {
        key: 'value',
        transform: val => <NumberLabel value={val} isColored />
      }
    ]
  };
}

function getPlayerTypeOptions() {
  const options = PLAYER_TYPES.map(type => ({
    label: capitalize(type),
    icon: getPlayerIcon(type),
    value: type
  }));

  return [{ label: 'All player types', value: null }, ...options];
}

function getPlayerBuildOptions() {
  const options = PLAYER_BUILDS.map(type => ({
    label: getPlayerBuild(type),
    value: type
  }));

  return [{ label: 'All player builds', value: null }, ...options];
}

function getMetricOptions() {
  return ALL_METRICS.map(metric => ({
    label: getMetricName(metric),
    icon: getMetricIcon(metric, true),
    value: metric
  }));
}

function getPlayerURL(username, metric) {
  let section = '';

  if (isSkill(metric) || metric === 'ehp') {
    section = 'skilling';
  } else if (isBoss(metric) || metric === 'ehb') {
    section = 'bossing';
  } else {
    section = 'activities';
  }

  return `/players/${username}/records/${section}`;
}

function getNextUrl(nextMetric, nextType, nextBuild) {
  const baseUrl = `/records/${nextMetric}?`;
  const queries = [];

  if (nextType !== null) {
    queries.push(`type=${nextType}`);
  }

  if (nextBuild !== null) {
    queries.push(`build=${nextBuild}`);
  }

  return `${baseUrl}${queries.join('&')}`;
}

function Records() {
  const router = useHistory();
  const dispatch = useDispatch();

  const { metric } = useParams();
  const { type, build } = useQuery(['type', 'build']);

  const selectedMetric = metric || 'overall';
  const selectedPlayerType = type || null;
  const selectedPlayerBuild = build || null;

  const metricOptions = useMemo(() => getMetricOptions(), []);
  const playerTypeOptions = useMemo(() => getPlayerTypeOptions(), []);
  const playerBuildOptions = useMemo(() => getPlayerBuildOptions(), []);

  const metricIndex = metricOptions.findIndex(o => o.value === selectedMetric);
  const playerTypeIndex = playerTypeOptions.findIndex(o => o.value === selectedPlayerType);
  const playerBuildIndex = playerBuildOptions.findIndex(o => o.value === selectedPlayerBuild);

  // Memoized redux variables
  const leaderboards = useSelector(recordSelectors.getLeaderboards);
  const isLoading6h = useSelector(recordSelectors.isFetching6h);
  const isLoadingDay = useSelector(recordSelectors.isFetchingDay);
  const isLoadingWeek = useSelector(recordSelectors.isFetchingWeek);
  const isLoadingMonth = useSelector(recordSelectors.isFetchingMonth);
  const isLoadingYear = useSelector(recordSelectors.isFetchingYear);

  const reloadList = () => {
    const periods = ['6h', 'day', 'week', 'month', 'year'];

    periods.forEach(p => {
      dispatch(
        recordActions.fetchLeaderboards(selectedMetric, p, selectedPlayerType, selectedPlayerBuild)
      );
    });
  };

  const handleMetricSelected = e => {
    if (!e || !e.value) return;
    router.push(getNextUrl(e.value, selectedPlayerType, selectedPlayerBuild));
  };

  const handleTypeSelected = e => {
    router.push(getNextUrl(selectedMetric, e.value, selectedPlayerBuild));
  };

  const handleBuildSelected = e => {
    router.push(getNextUrl(selectedMetric, selectedPlayerType, e.value));
  };

  const tableConfig = useMemo(() => getTableConfig(selectedMetric), [selectedMetric]);

  useEffect(reloadList, [selectedMetric, selectedPlayerType, selectedPlayerBuild]);

  return (
    <div className="records__container container">
      <Helmet>
        <title>{`${getMetricName(selectedMetric)} global records`}</title>
      </Helmet>
      <div className="records__header row">
        <div className="col">
          <PageTitle title="Records" />
        </div>
      </div>
      <div className="records__filters row">
        <div className="col-lg-4 col-md-6">
          <Selector
            options={metricOptions}
            selectedIndex={metricIndex}
            onSelect={handleMetricSelected}
            search
          />
        </div>
        <div className="col-lg-2 col-md-4">
          <Selector
            options={playerTypeOptions}
            selectedIndex={playerTypeIndex}
            onSelect={handleTypeSelected}
          />
        </div>
        <div className="col-lg-3 col-md-5">
          {new Date() > new Date('2020-08-20') && (
            <Selector
              options={playerBuildOptions}
              selectedIndex={playerBuildIndex}
              onSelect={handleBuildSelected}
            />
          )}
        </div>
      </div>
      <div className="records__list row">
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Day</h3>
          {isLoadingDay && <img className="loading-icon" src="/img/icons/loading.png" alt="" />}
          {!leaderboards || !leaderboards.day ? (
            <TablePlaceholder size={20} />
          ) : (
            <Table
              uniqueKeySelector={tableConfig.uniqueKey}
              columns={tableConfig.columns}
              rows={leaderboards.day}
              listStyle
            />
          )}
        </div>
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Week</h3>
          {isLoadingWeek && <img className="loading-icon" src="/img/icons/loading.png" alt="" />}
          {!leaderboards || !leaderboards.week ? (
            <TablePlaceholder size={20} />
          ) : (
            <Table
              uniqueKeySelector={tableConfig.uniqueKey}
              columns={tableConfig.columns}
              rows={leaderboards.week}
              listStyle
            />
          )}
        </div>
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Month</h3>
          {isLoadingMonth && <img className="loading-icon" src="/img/icons/loading.png" alt="" />}
          {!leaderboards || !leaderboards.month ? (
            <TablePlaceholder size={20} />
          ) : (
            <Table
              uniqueKeySelector={tableConfig.uniqueKey}
              columns={tableConfig.columns}
              rows={leaderboards.month}
              listStyle
            />
          )}
        </div>
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">6 hours</h3>
          {isLoading6h && <img className="loading-icon" src="/img/icons/loading.png" alt="" />}
          {!leaderboards || !leaderboards['6h'] ? (
            <TablePlaceholder size={20} />
          ) : (
            <Table
              uniqueKeySelector={tableConfig.uniqueKey}
              columns={tableConfig.columns}
              rows={leaderboards['6h']}
              listStyle
            />
          )}
        </div>
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Year</h3>
          {isLoadingYear && <img className="loading-icon" src="/img/icons/loading.png" alt="" />}
          {!leaderboards || !leaderboards.year ? (
            <TablePlaceholder size={20} />
          ) : (
            <Table
              uniqueKeySelector={tableConfig.uniqueKey}
              columns={tableConfig.columns}
              rows={leaderboards.year}
              listStyle
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Records;
