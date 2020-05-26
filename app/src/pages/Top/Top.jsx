import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PageTitle from '../../components/PageTitle';
import PlayerTag from '../../components/PlayerTag';
import Selector from '../../components/Selector';
import TableList from '../../components/TableList';
import NumberLabel from '../../components/NumberLabel';
import TableListPlaceholder from '../../components/TableListPlaceholder';
import { PLAYER_TYPES, ALL_METRICS } from '../../config';
import {
  capitalize,
  getPlayerTypeIcon,
  getMetricIcon,
  getMetricName,
  isSkill,
  isBoss
} from '../../utils';
import fetchLeaderboard from '../../redux/modules/deltas/actions/fetchLeaderboard';
import { getLeaderboard, isFetchingLeaderboard } from '../../redux/selectors/deltas';
import './Top.scss';

function getTableConfig(metric, period) {
  return {
    uniqueKey: row => row.username,
    columns: [
      {
        key: 'rank',
        width: '30',
        transform: rank => <span className="top-rank">{rank}</span>
      },
      {
        key: 'displayName',
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={getPlayerURL(row.playerId, metric, period)}>
            <PlayerTag name={value} type={row.type} />
          </Link>
        )
      },
      {
        key: 'gained',
        width: 90,
        transform: val => <NumberLabel value={val} isColored />
      }
    ]
  };
}

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

function getPlayerURL(playerId, metric, period) {
  if (isSkill(metric)) {
    return `/players/${playerId}/gained/skilling/?metric=${metric}&period=${period}`;
  }

  if (isBoss(metric)) {
    return `/players/${playerId}/gained/bossing/?metric=${metric}&period=${period}`;
  }

  return `/players/${playerId}/gained/activities/?metric=${metric}&period=${period}`;
}

function Top() {
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
  const isLoading = useSelector(state => isFetchingLeaderboard(state));

  const reloadList = () => {
    dispatch(fetchLeaderboard({ metric: selectedMetric, playerType: selectedPlayerType }));
  };

  const handleMetricSelected = e => {
    if (e && e.value) {
      router.push(`/top/${e.value}/${selectedPlayerType || ''}`);
    }
  };

  const handleTypeSelected = e => {
    if (e && e.value) {
      router.push(`/top/${selectedMetric}/${e.value}`);
    } else {
      router.push(`/top/${selectedMetric}`);
    }
  };

  const onMetricSelected = useCallback(handleMetricSelected, [selectedMetric, selectedPlayerType]);
  const onTypeSelected = useCallback(handleTypeSelected, [selectedMetric, selectedPlayerType]);

  const dayTableConfig = useMemo(() => getTableConfig(selectedMetric, 'day'), [selectedMetric]);
  const weekTableConfig = useMemo(() => getTableConfig(selectedMetric, 'week'), [selectedMetric]);
  const monthTableConfig = useMemo(() => getTableConfig(selectedMetric, 'month'), [selectedMetric]);

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
        <div className="col-md-2">
          {isLoading && <img className="loading-icon" src="/img/icons/loading.png" alt="" />}
        </div>
      </div>
      <div className="top__list row">
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Day</h3>
          {!leaderboard || !leaderboard.day ? (
            <TableListPlaceholder size={20} />
          ) : (
            <TableList
              uniqueKeySelector={dayTableConfig.uniqueKey}
              columns={dayTableConfig.columns}
              rows={leaderboard.day}
            />
          )}
        </div>
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Week</h3>
          {!leaderboard || !leaderboard.week ? (
            <TableListPlaceholder size={20} />
          ) : (
            <TableList
              uniqueKeySelector={weekTableConfig.uniqueKey}
              columns={weekTableConfig.columns}
              rows={leaderboard.week}
            />
          )}
        </div>
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Month</h3>
          {!leaderboard || !leaderboard.month ? (
            <TableListPlaceholder size={20} />
          ) : (
            <TableList
              uniqueKeySelector={monthTableConfig.uniqueKey}
              columns={monthTableConfig.columns}
              rows={leaderboard.month}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Top;
