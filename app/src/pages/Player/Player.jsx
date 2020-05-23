import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import _ from 'lodash';
import queryString from 'query-string';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Selector from '../../components/Selector';
import Tabs from '../../components/Tabs';
import LineChart from '../../components/LineChart';
import Dropdown from '../../components/Dropdown';
import PlayerInfo from './components/PlayerInfo';
import PlayerStatsTable from './components/PlayerStatsTable';
import PlayerDeltasTable from './components/PlayerDeltasTable';
import PlayerAchievementsWidget from './components/PlayerAchievementsWidget';
import PlayerCompetitionsTable from './components/PlayerCompetitionsTable';
import PlayerGroupsTable from './components/PlayerGroupsTable';
import PlayerRecords from './components/PlayerRecords';
import PlayerDeltasInfo from './components/PlayerDeltasInfo';
import PlayerHighlights from './components/PlayerHighlights';
import { getPlayer, isFetching } from '../../redux/selectors/players';
import { getPlayerDeltas } from '../../redux/selectors/deltas';
import { getPlayerRecords } from '../../redux/selectors/records';
import { getPlayerAchievements } from '../../redux/selectors/achievements';
import { getPlayerCompetitions } from '../../redux/selectors/competitions';
import { getPlayerGroups } from '../../redux/selectors/groups';
import { getChartData } from '../../redux/selectors/snapshots';
import trackPlayerAction from '../../redux/modules/players/actions/track';
import assertPlayerTypeAction from '../../redux/modules/players/actions/assertType';
import fetchPlayerAction from '../../redux/modules/players/actions/fetch';
import fetchDeltasAction from '../../redux/modules/deltas/actions/fetch';
import fetchSnapshotsAction from '../../redux/modules/snapshots/actions/fetch';
import fetchRecordsAction from '../../redux/modules/records/actions/fetch';
import fetchAchievementsAction from '../../redux/modules/achievements/actions/fetch';
import fetchCompetitionsAction from '../../redux/modules/competitions/actions/fetchPlayerCompetitions';
import fetchGroupsAction from '../../redux/modules/groups/actions/fetchPlayerGroups';
import { getPlayerTypeIcon, getOfficialHiscoresUrl, getPlayerTooltip, getMeasure } from '../../utils';
import { SKILLS, ACTIVITIES, BOSSES, ALL_METRICS } from '../../config';
import './Player.scss';

const TABS = ['Overview', 'Gained', 'Competitions', 'Groups', 'Records', 'Achievements'];

const PERIOD_OPTIONS = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' }
];

const LEVEL_TYPE_OPTIONS = [
  { label: 'Show Regular Levels', value: 'regular' },
  { label: 'Show Virtual Levels', value: 'virtual' }
];

const METRIC_TYPE_OPTIONS = [
  { label: 'Skilling', value: 'skilling' },
  { label: 'Bossing', value: 'bossing' },
  { label: 'Activities', value: 'activities' }
];

const MENU_OPTIONS = [
  { label: 'Open official hiscores', value: 'openOsrsHiscores' },
  { label: 'Reassign player type', value: 'assertType' }
];

function getSelectedTabIndex(section) {
  const index = TABS.findIndex(t => t.toLowerCase() === section);
  return Math.max(0, index);
}

function getSelectedMetricType(metricType) {
  const index = METRIC_TYPE_OPTIONS.findIndex(t => t.value.toLowerCase() === metricType);
  return METRIC_TYPE_OPTIONS[Math.max(0, index)].value;
}

function getSelectedPeriod(location) {
  const params = queryString.parse(location.search);
  const queryPeriod = params.period;

  const index = PERIOD_OPTIONS.findIndex(t => t.value.toLowerCase() === queryPeriod);
  return PERIOD_OPTIONS[index === -1 ? 1 : index].value;
}

function getSelectedMetric(metricType, location) {
  const params = queryString.parse(location.search);
  const queryMetric = params.metric;

  return ALL_METRICS.includes(queryMetric) ? queryMetric : getMetricList(metricType)[0];
}

function getMetricList(metricType) {
  switch (metricType) {
    case 'bossing':
      return BOSSES;
    case 'activities':
      return ACTIVITIES;
    default:
      return SKILLS;
  }
}

function buildQuerySearch(options) {
  const obj = {};

  if (options.virtual) {
    obj.virtual = true;
  }

  if (options.metric && options.metric !== getMetricList(options.metricType)[0]) {
    obj.metric = options.metric;
  }

  if (options.period && options.period !== 'week') {
    obj.period = options.period;
  }

  const str = _.map(obj, (val, key) => `${key}=${val}`).join('&');
  return str.length > 0 ? `?${str}` : '';
}

function Player() {
  const { id, section, metricType } = useParams();
  const location = useLocation();
  const router = useHistory();
  const dispatch = useDispatch();

  const selectedTabIndex = getSelectedTabIndex(section);
  const selectedMetricType = getSelectedMetricType(metricType);
  const selectedPeriod = getSelectedPeriod(location);
  const selectedMetric = getSelectedMetric(selectedMetricType, location);

  const [isTracking, setIsTracking] = useState(false);
  const [selectedLevelType, setSelectedLevelType] = useState('regular');

  // Memoized redux variables
  const player = useSelector(state => getPlayer(state, id));
  const deltas = useSelector(state => getPlayerDeltas(state, id));
  const records = useSelector(state => getPlayerRecords(state, id));
  const achievements = useSelector(state => getPlayerAchievements(state, id));
  const competitions = useSelector(state => getPlayerCompetitions(state, id));
  const groups = useSelector(state => getPlayerGroups(state, id));
  const isLoadingDetails = useSelector(state => isFetching(state));

  const metricTypeIndex = METRIC_TYPE_OPTIONS.findIndex(o => o.value === selectedMetricType);
  const levelTypeIndex = LEVEL_TYPE_OPTIONS.findIndex(o => o.value === selectedLevelType);
  const deltasPeriodIndex = PERIOD_OPTIONS.findIndex(o => o.value === selectedPeriod);

  const experienceChartData = useSelector(state =>
    getChartData(state, id, selectedPeriod, selectedMetric, getMeasure(selectedMetric))
  );

  const rankChartData = useSelector(state =>
    getChartData(state, id, selectedPeriod, selectedMetric, 'rank')
  );

  const trackPlayer = async () => {
    try {
      setIsTracking(true);
      await dispatch(trackPlayerAction(player.username));

      fetchAll();
      setIsTracking(false);
    } catch (e) {
      setIsTracking(false);
    }
  };

  const fetchAll = () => {
    // Attempt to fetch player of that id, if it fails redirect to 404
    dispatch(fetchPlayerAction({ id }))
      .then(action => {
        if (action.error) throw new Error();
      })
      .catch(() => router.push('/404'));

    dispatch(fetchSnapshotsAction({ playerId: id }));
    dispatch(fetchAchievementsAction({ playerId: id }));
    dispatch(fetchCompetitionsAction({ playerId: id }));
    dispatch(fetchGroupsAction({ playerId: id }));
    dispatch(fetchRecordsAction({ playerId: id }));
    dispatch(fetchDeltasAction({ playerId: id }));
  };

  const getNextUrl = options => {
    const newOptions = {
      id,
      section: TABS[selectedTabIndex].toLowerCase(),
      metricType: selectedMetricType,
      metric: selectedMetric,
      period: selectedPeriod,
      ...options
    };

    const metricList = getMetricList(newOptions.metricType);
    newOptions.metric = metricList.includes(newOptions.metric) ? newOptions.metric : metricList[0];

    const query = buildQuerySearch(newOptions);
    return `/players/${newOptions.id}/${newOptions.section}/${newOptions.metricType}${query}`;
  };

  const handleTabChanged = i => {
    router.push(getNextUrl({ section: TABS[i].toLowerCase() }));
  };

  const handlePeriodSelected = e => {
    router.push(getNextUrl({ period: e.value }));
  };

  const handleMetricSelected = metric => {
    router.push(getNextUrl({ metric }));
  };

  const handleLevelTypeSelected = e => {
    setSelectedLevelType((e && e.value) || null);
  };

  const handleMetricTypeSelected = e => {
    router.push(getNextUrl({ metricType: e.value }));
  };

  const handleOptionSelected = async option => {
    if (option.value === 'assertType') {
      await dispatch(assertPlayerTypeAction(player.username, player.id));
    } else if (option.value === 'openOsrsHiscores') {
      window.location = getOfficialHiscoresUrl(player);
    }
  };

  const handleDeltasTimerEnded = () => {
    dispatch(fetchDeltasAction({ playerId: id }));
  };

  const onLevelTypeSelected = useCallback(handleLevelTypeSelected, [setSelectedLevelType]);
  const onOptionSelected = useCallback(handleOptionSelected, [player]);
  const onUpdateButtonClicked = useCallback(trackPlayer, [player]);
  const onDeltasTimerEnded = useCallback(handleDeltasTimerEnded, [id]);

  // Fetch all player info on mount
  useEffect(fetchAll, [dispatch, id]);

  if (!player) {
    return null;
  }

  return (
    <div className="player__container container">
      <Helmet>
        <title>{player.username}</title>
      </Helmet>
      <div className="player__header row">
        <div className="col">
          <PageHeader
            title={player.displayName}
            icon={getPlayerTypeIcon(player.type)}
            iconTooltip={getPlayerTooltip(player.type)}
          >
            <Button text="Update" onClick={onUpdateButtonClicked} loading={isTracking} />
            <Dropdown options={MENU_OPTIONS} onSelect={onOptionSelected}>
              <button className="header__options-btn" type="button">
                <img src="/img/icons/options.svg" alt="" />
              </button>
            </Dropdown>
          </PageHeader>
        </div>
      </div>
      <div className="player__controls row">
        <div className="col-md-12 col-lg-7">
          <Tabs
            tabs={TABS}
            selectedIndex={selectedTabIndex}
            onChange={handleTabChanged}
            align="space-between"
          />
        </div>
        {selectedTabIndex === 0 && (
          <>
            <div className="col-md-6 col-lg-2">
              <Selector
                options={METRIC_TYPE_OPTIONS}
                selectedIndex={metricTypeIndex}
                onSelect={handleMetricTypeSelected}
              />
            </div>
            <div className="col-md-6 col-lg-3">
              <Selector
                options={LEVEL_TYPE_OPTIONS}
                selectedIndex={levelTypeIndex}
                onSelect={onLevelTypeSelected}
                disabled={selectedMetricType !== 'skilling'}
              />
            </div>
          </>
        )}
        {selectedTabIndex === 1 && (
          <>
            <div className="col-md-6 col-lg-2">
              <Selector
                options={METRIC_TYPE_OPTIONS}
                selectedIndex={metricTypeIndex}
                onSelect={handleMetricTypeSelected}
              />
            </div>
            <div className="col-md-6 col-lg-3">
              <Selector
                options={PERIOD_OPTIONS}
                selectedIndex={deltasPeriodIndex}
                onSelect={handlePeriodSelected}
              />
            </div>
          </>
        )}
        {selectedTabIndex === 4 && (
          <>
            <div className="col-md-6 col-lg-2">
              <Selector
                options={METRIC_TYPE_OPTIONS}
                selectedIndex={metricTypeIndex}
                onSelect={handleMetricTypeSelected}
              />
            </div>
            <div className="col-md-6 col-lg-3">
              <Selector disabled />
            </div>
          </>
        )}
        {(selectedTabIndex === 2 || selectedTabIndex === 3 || selectedTabIndex === 5) && (
          <>
            <div className="col-md-6 col-lg-2">
              <Selector disabled />
            </div>
            <div className="col-md-6 col-lg-3">
              <Selector disabled />
            </div>
          </>
        )}
      </div>
      <div className="player__content row">
        {selectedTabIndex === 0 && (
          <>
            <div className="col-lg-3 col-md-7">
              <span className="panel-label">Player details</span>
              <PlayerInfo player={player} />
            </div>
            <div className="col-lg-3 col-md-5">
              {competitions && (
                <PlayerHighlights
                  player={player}
                  competitions={competitions}
                  achievements={achievements}
                />
              )}
            </div>
            <div className="col-lg-6 col-md-12">
              <span className="panel-label">Current stats</span>
              <PlayerStatsTable
                player={player}
                showVirtualLevels={selectedLevelType === 'virtual'}
                metricType={selectedMetricType}
                isLoading={isLoadingDetails}
              />
            </div>
          </>
        )}
        {selectedTabIndex === 1 && (
          <>
            <div className="col-lg-6 col-md-12">
              <LineChart datasets={experienceChartData} />
              <LineChart datasets={rankChartData} invertYAxis />
            </div>
            <div className="col-lg-6 col-md-12">
              <PlayerDeltasInfo
                deltas={deltas}
                period={selectedPeriod}
                onTimerEnded={onDeltasTimerEnded}
              />
              {deltas && selectedPeriod && deltas[selectedPeriod] && (
                <PlayerDeltasTable
                  deltas={deltas}
                  period={selectedPeriod}
                  metricType={selectedMetricType}
                  highlightedMetric={selectedMetric}
                  onMetricSelected={handleMetricSelected}
                />
              )}
            </div>
          </>
        )}
        {selectedTabIndex === 2 && (
          <div className="col">
            <PlayerCompetitionsTable competitions={competitions} />
          </div>
        )}
        {selectedTabIndex === 3 && (
          <div className="col">
            <PlayerGroupsTable groups={groups} />
          </div>
        )}
        {selectedTabIndex === 4 && (
          <div className="col">
            <PlayerRecords records={records} metricType={selectedMetricType} />
          </div>
        )}
        {selectedTabIndex === 5 && (
          <>
            <div className="col-md-6 col-lg-4">
              <PlayerAchievementsWidget achievements={achievements} type="general" />
            </div>
            <div className="col-md-6 col-lg-4">
              <PlayerAchievementsWidget achievements={achievements} type="experience" />
            </div>
            <div className="col-md-6 col-lg-4">
              <PlayerAchievementsWidget achievements={achievements} type="levels" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Player;
