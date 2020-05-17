import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PageTitle from '../../components/PageTitle';
import Selector from '../../components/Selector';
import PlayerTag from '../../components/PlayerTag';
import TableList from '../../components/TableList';
import NumberLabel from '../../components/NumberLabel';
import TableListPlaceholder from '../../components/TableListPlaceholder';
import { PLAYER_TYPES, ALL_METRICS } from '../../config';
import { formatDate, getPlayerTypeIcon, getMetricIcon, capitalize, getMetricName } from '../../utils';
import fetchLeaderboard from '../../redux/modules/records/actions/fetchLeaderboard';
import { getLeaderboard } from '../../redux/selectors/records';
import './Records.scss';

const TABLE_CONFIG = {
  uniqueKey: row => row.username,
  columns: [
    {
      key: 'rank',
      width: '10',
      transform: rank => <span className="record-rank">{rank}</span>
    },
    {
      key: 'username',
      className: () => '-primary',
      transform: (value, row) => <PlayerTag username={value} type={row.type} />
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

function getPlayerTypeOptions() {
  return [
    { label: 'All players', value: null },
    ...PLAYER_TYPES.map(type => ({
      label: capitalize(type),
      icon: getPlayerTypeIcon(type),
      value: type
    }))
  ];
}

function getMetricOptions() {
  return ALL_METRICS.map(metric => ({
    label: getMetricName(metric),
    icon: getMetricIcon(metric, true),
    value: metric
  }));
}

function Records() {
  const { metric, playerType } = useParams();
  const router = useHistory();
  const dispatch = useDispatch();

  const selectedMetric = metric || 'overall';
  const selectedPlayerType = playerType || null;

  const metricOptions = useMemo(() => getMetricOptions(), []);
  const playerTypeOptions = useMemo(() => getPlayerTypeOptions(), []);

  const metricIndex = metricOptions.findIndex(o => o.value === selectedMetric);
  const playerTypeIndex = playerTypeOptions.findIndex(o => o.value === selectedPlayerType);

  // Memoized redux variables
  const leaderboard = useSelector(state => getLeaderboard(state));

  const reloadList = () => {
    dispatch(fetchLeaderboard({ metric: selectedMetric, playerType: selectedPlayerType }));
  };

  const handleMetricSelected = e => {
    if (e && e.value) {
      router.push(`/records/${e.value}/${selectedPlayerType || ''}`);
    }
  };

  const handleTypeSelected = e => {
    if (e && e.value) {
      router.push(`/records/${selectedMetric}/${e.value}`);
    } else {
      router.push(`/records/${selectedMetric}`);
    }
  };

  const handleDayRowClicked = index => {
    const { playerId } = leaderboard.day[index];
    router.push(`/players/${playerId}`);
  };

  const handleWeekRowClicked = index => {
    const { playerId } = leaderboard.week[index];
    router.push(`/players/${playerId}`);
  };

  const handleMonthRowClicked = index => {
    const { playerId } = leaderboard.month[index];
    router.push(`/players/${playerId}`);
  };

  const onMetricSelected = useCallback(handleMetricSelected, [selectedMetric, selectedPlayerType]);
  const onTypeSelected = useCallback(handleTypeSelected, [selectedMetric, selectedPlayerType]);

  const onDayRowClicked = useCallback(handleDayRowClicked, [leaderboard]);
  const onWeekRowClicked = useCallback(handleWeekRowClicked, [leaderboard]);
  const onMonthRowClicked = useCallback(handleMonthRowClicked, [leaderboard]);

  useEffect(reloadList, [selectedMetric, selectedPlayerType]);

  return (
    <div className="records__container container">
      <Helmet>
        <title>{`${capitalize(selectedMetric)} global records`}</title>
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
            onSelect={onMetricSelected}
            search
          />
        </div>
        <div className="col-lg-2 col-md-4">
          <Selector
            options={playerTypeOptions}
            selectedIndex={playerTypeIndex}
            onSelect={onTypeSelected}
          />
        </div>
      </div>
      <div className="records__list row">
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Day</h3>
          {!leaderboard || !leaderboard.day ? (
            <TableListPlaceholder size={20} />
          ) : (
            <TableList
              uniqueKeySelector={TABLE_CONFIG.uniqueKey}
              columns={TABLE_CONFIG.columns}
              rows={leaderboard.day}
              onRowClicked={onDayRowClicked}
              clickable
            />
          )}
        </div>
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Week</h3>
          {!leaderboard || !leaderboard.week ? (
            <TableListPlaceholder size={20} />
          ) : (
            <TableList
              uniqueKeySelector={TABLE_CONFIG.uniqueKey}
              columns={TABLE_CONFIG.columns}
              rows={leaderboard.week}
              onRowClicked={onWeekRowClicked}
              clickable
            />
          )}
        </div>
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Month</h3>
          {!leaderboard || !leaderboard.month ? (
            <TableListPlaceholder size={20} />
          ) : (
            <TableList
              uniqueKeySelector={TABLE_CONFIG.uniqueKey}
              columns={TABLE_CONFIG.columns}
              rows={leaderboard.month}
              onRowClicked={onMonthRowClicked}
              clickable
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Records;
