import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PageTitle from '../../components/PageTitle';
import PlayerTag from '../../components/PlayerTag';
import Selector from '../../components/Selector';
import TableList from '../../components/TableList';
import NumberLabel from '../../components/NumberLabel';
import TableListPlaceholder from '../../components/TableListPlaceholder';
import { PLAYER_TYPES, ALL_METRICS } from '../../config';
import { capitalize, getPlayerTypeIcon, getMetricIcon, getMetricName } from '../../utils';
import fetchLeaderboard from '../../redux/modules/deltas/actions/fetchLeaderboard';
import { getLeaderboard } from '../../redux/selectors/deltas';
import './Top.scss';

const TABLE_CONFIG = {
  uniqueKey: row => row.username,
  columns: [
    {
      key: 'rank',
      width: '30',
      transform: rank => <span className="top-rank">{rank}</span>
    },
    {
      key: 'username',
      className: () => '-primary',
      transform: (value, row) => <PlayerTag username={value} type={row.type} />
    },
    {
      key: 'gained',
      width: 90,
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

function Top() {
  const router = useHistory();
  const dispatch = useDispatch();

  // State variables
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [selectedPlayerType, setSelectedPlayerType] = useState(null);

  const metricOptions = useMemo(() => getMetricOptions(), []);
  const playerTypeOptions = useMemo(() => getPlayerTypeOptions(), []);

  const selectedMetricIndex = metricOptions.findIndex(o => o.value === selectedMetric);
  const selectedPlayerTypeIndex = playerTypeOptions.findIndex(o => o.value === selectedPlayerType);

  // Memoized redux variables
  const leaderboard = useSelector(state => getLeaderboard(state));

  const reloadList = () => {
    dispatch(fetchLeaderboard({ metric: selectedMetric, playerType: selectedPlayerType }));
  };

  const handleMetricSelected = e => {
    setSelectedMetric((e && e.value) || null);
  };

  const handleTypeSelected = e => {
    setSelectedPlayerType((e && e.value) || null);
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

  const onMetricSelected = useCallback(handleMetricSelected, [setSelectedMetric]);
  const onTypeSelected = useCallback(handleTypeSelected, [setSelectedPlayerType]);
  const onDayRowClicked = useCallback(handleDayRowClicked, [leaderboard]);
  const onWeekRowClicked = useCallback(handleWeekRowClicked, [leaderboard]);
  const onMonthRowClicked = useCallback(handleMonthRowClicked, [leaderboard]);

  useEffect(reloadList, [selectedMetric, selectedPlayerType]);

  return (
    <div className="top__container container">
      <Helmet>
        <title>{`${getMetricName(selectedMetric)} current top`}</title>
      </Helmet>
      <div className="top__header row">
        <div className="col">
          <PageTitle title="Current Top" />
        </div>
      </div>
      <div className="top__filters row">
        <div className="col-lg-4 col-md-6">
          <Selector
            options={metricOptions}
            selectedIndex={selectedMetricIndex}
            onSelect={onMetricSelected}
            search
          />
        </div>
        <div className="col-lg-2 col-md-4">
          <Selector
            options={playerTypeOptions}
            selectedIndex={selectedPlayerTypeIndex}
            onSelect={onTypeSelected}
          />
        </div>
      </div>
      <div className="top__list row">
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

export default Top;
