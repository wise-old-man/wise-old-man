import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PageTitle from '../../components/PageTitle';
import PlayerTag from '../../components/PlayerTag';
import Selector from '../../components/Selector';
import TableList from '../../components/TableList';
import NumberLabel from '../../components/NumberLabel';
import TableListPlaceholder from '../../components/TableListPlaceholder';
import { PLAYER_TYPES, SKILLS } from '../../config';
import { capitalize, getPlayerTypeIcon, getSkillIcon } from '../../utils';
import fetchLeaderboard from '../../redux/modules/deltas/actions/fetchLeaderboard';
import { getLeaderboard } from '../../redux/selectors/deltas';
import './Top.scss';

const DEFAULT_TYPE_OPTIONS = { label: 'All players', value: null };

const TABLE_CONFIG = {
  uniqueKey: row => row.username,
  columns: [
    { key: 'rank', width: 30 },
    {
      key: 'username',
      className: () => '-primary',
      transform: (value, row) => <PlayerTag username={value} type={row.type} />
    },
    {
      key: 'gained',
      transform: val => <NumberLabel value={val} isColored />
    }
  ]
};

function getTypeOptions() {
  return [
    ...PLAYER_TYPES.map(type => ({
      label: capitalize(type),
      icon: getPlayerTypeIcon(type),
      value: type
    }))
  ];
}

function getMetricOptions() {
  return [
    ...SKILLS.map(skill => ({
      label: capitalize(skill),
      icon: getSkillIcon(skill, true),
      value: skill
    }))
  ];
}

function Top() {
  const router = useHistory();
  const dispatch = useDispatch();

  // Memoized variables
  const metricOptions = useMemo(getMetricOptions, []);
  const typeOptions = useMemo(getTypeOptions, []);

  // State variables
  const [selectedMetric, setSelectedMetric] = useState(metricOptions[0].value);
  const [selectedType, setSelectedType] = useState(null);

  // Memoized redux variables
  const leaderboard = useSelector(state => getLeaderboard(state));

  function reloadList() {
    dispatch(fetchLeaderboard({ metric: selectedMetric, playerType: selectedType }));
  }

  const handleMetricSelected = e => {
    setSelectedMetric((e && e.value) || null);
  };

  const handleTypeSelected = e => {
    setSelectedType((e && e.value) || null);
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
  const onTypeSelected = useCallback(handleTypeSelected, [setSelectedType]);
  const onDayRowClicked = useCallback(handleDayRowClicked, [leaderboard]);
  const onWeekRowClicked = useCallback(handleWeekRowClicked, [leaderboard]);
  const onMonthRowClicked = useCallback(handleMonthRowClicked, [leaderboard]);

  useEffect(reloadList, [selectedMetric, selectedType]);

  return (
    <div className="top__container container">
      <Helmet>
        <title>{`${capitalize(selectedMetric)} current top`}</title>
      </Helmet>
      <div className="top__header row">
        <div className="col">
          <PageTitle title="Current Top" />
        </div>
      </div>
      <div className="top__filters row">
        <div className="col-md-3">
          <Selector options={metricOptions} onSelect={onMetricSelected} />
        </div>
        <div className="col-md-3">
          <Selector
            options={typeOptions}
            defaultOption={DEFAULT_TYPE_OPTIONS}
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
