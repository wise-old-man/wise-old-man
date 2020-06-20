import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PageTitle from '../../components/PageTitle';
import Selector from '../../components/Selector';
import PlayerTag from '../../components/PlayerTag';
import Table from '../../components/Table';
import NumberLabel from '../../components/NumberLabel';
import TablePlaceholder from '../../components/TablePlaceholder';
import { PLAYER_TYPES, ALL_METRICS } from '../../config';
import {
  formatDate,
  getPlayerTypeIcon,
  getMetricIcon,
  capitalize,
  getMetricName,
  isSkill,
  isBoss
} from '../../utils';
import fetchLeaderboard from '../../redux/modules/records/actions/fetchLeaderboard';
import { getLeaderboard, isFetchingLeaderboard } from '../../redux/selectors/records';
import './Records.scss';

function getTableConfig(metric) {
  return {
    uniqueKey: row => row.username,
    columns: [
      {
        key: 'rank',
        width: '10',
        transform: rank => <span className="record-rank">{rank}</span>
      },
      {
        key: 'displayName',
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={getPlayerURL(row.playerId, metric)}>
            <PlayerTag name={value} type={row.type} />
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

function getPlayerURL(playerId, metric) {
  if (isSkill(metric)) {
    return `/players/${playerId}/records/skilling`;
  }

  if (isBoss(metric)) {
    return `/players/${playerId}/records/bossing`;
  }

  return `/players/${playerId}/records/activities`;
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
  const isLoading = useSelector(state => isFetchingLeaderboard(state));

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

  const onMetricSelected = useCallback(handleMetricSelected, [selectedMetric, selectedPlayerType]);
  const onTypeSelected = useCallback(handleTypeSelected, [selectedMetric, selectedPlayerType]);

  const tableConfig = useMemo(() => getTableConfig(selectedMetric), [selectedMetric]);

  useEffect(reloadList, [selectedMetric, selectedPlayerType]);

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
      <div className="records__list row">
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Day</h3>
          {!leaderboard || !leaderboard.day ? (
            <TablePlaceholder size={20} />
          ) : (
            <Table
              uniqueKeySelector={tableConfig.uniqueKey}
              columns={tableConfig.columns}
              rows={leaderboard.day}
              listStyle
            />
          )}
        </div>
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Week</h3>
          {!leaderboard || !leaderboard.week ? (
            <TablePlaceholder size={20} />
          ) : (
            <Table
              uniqueKeySelector={tableConfig.uniqueKey}
              columns={tableConfig.columns}
              rows={leaderboard.week}
              listStyle
            />
          )}
        </div>
        <div className="col-lg-4 col-md-6">
          <h3 className="period-label">Month</h3>
          {!leaderboard || !leaderboard.month ? (
            <TablePlaceholder size={20} />
          ) : (
            <Table
              uniqueKeySelector={tableConfig.uniqueKey}
              columns={tableConfig.columns}
              rows={leaderboard.month}
              listStyle
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Records;
