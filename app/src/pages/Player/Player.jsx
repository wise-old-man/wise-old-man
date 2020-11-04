import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import _ from 'lodash';
import queryString from 'query-string';
import * as snapshotsActions from 'redux/snapshots/actions';
import * as snapshotsSelectors from 'redux/snapshots/selectors';
import * as recordsActions from 'redux/records/actions';
import * as recordsSelectors from 'redux/records/selectors';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Selector from '../../components/Selector';
import Tabs from '../../components/Tabs';
import LineChart from '../../components/LineChart';
import Dropdown from '../../components/Dropdown';
import PlayerInfo from './components/PlayerInfo';
import PlayerStatsTable from './components/PlayerStatsTable';
import PlayerDeltasTable from './components/PlayerDeltasTable';
import PlayerAchievements from './components/PlayerAchievements';
import PlayerCompetitionsTable from './components/PlayerCompetitionsTable';
import PlayerGroupsTable from './components/PlayerGroupsTable';
import PlayerRecords from './components/PlayerRecords';
import PlayerDeltasInfo from './components/PlayerDeltasInfo';
import PlayerHighlights from './components/PlayerHighlights';
import PlayerCards from './components/PlayerCards';
import { getPlayer, isFetching } from '../../redux/selectors/players';
import { getPlayerDeltas } from '../../redux/selectors/deltas';
import { getPlayerAchievementsGrouped, getPlayerAchievements } from '../../redux/selectors/achievements';
import { getPlayerCompetitions } from '../../redux/selectors/competitions';
import { getPlayerGroups } from '../../redux/selectors/groups';
import trackPlayerAction from '../../redux/modules/players/actions/track';
import assertPlayerTypeAction from '../../redux/modules/players/actions/assertType';
import assertPlayerNameAction from '../../redux/modules/players/actions/assertName';
import fetchPlayerAction from '../../redux/modules/players/actions/fetch';
import fetchDeltasAction from '../../redux/modules/deltas/actions/fetchPlayerDeltas';
import fetchAchievementsAction from '../../redux/modules/achievements/actions/fetchPlayerAchievements';
import fetchCompetitionsAction from '../../redux/modules/competitions/actions/fetchPlayerCompetitions';
import fetchGroupsAction from '../../redux/modules/groups/actions/fetchPlayerGroups';
import {
  getPlayerIcon,
  getOfficialHiscoresUrl,
  getPlayerTooltip,
  getMeasure,
  standardizeUsername
} from '../../utils';
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
  { label: 'Reset username capitalization', value: 'assertName' },
  { label: 'Reassign player type', value: 'assertType' },
  { label: '[NEW] Change name', value: 'changeName' }
];

function getPlayerBadges(build) {
  switch (build) {
    case 'lvl3':
      return [{ text: 'Level 3', hoverText: '' }];
    case 'f2p':
      return [{ text: 'F2P', hoverText: '' }];
    case '1def':
      return [{ text: '1 Def Pure', hoverText: '' }];
    case '10hp':
      return [{ text: '10 HP Pure', hoverText: '' }];
    default:
      return [];
  }
}

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
      return [...BOSSES, 'ehb'];
    case 'activities':
      return ACTIVITIES;
    default:
      return [...SKILLS, 'ehp'];
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
  const params = useParams();
  const location = useLocation();
  const router = useHistory();
  const dispatch = useDispatch();

  const { section, metricType } = params;
  const username = standardizeUsername(params.username);

  const selectedTabIndex = getSelectedTabIndex(section);
  const selectedMetricType = getSelectedMetricType(metricType);
  const selectedPeriod = getSelectedPeriod(location);
  const selectedMetric = getSelectedMetric(selectedMetricType, location);

  const [isReducedChart, setIsReducedChart] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedLevelType, setSelectedLevelType] = useState('regular');

  // Memoized redux variables
  const player = useSelector(state => getPlayer(state, username));
  const deltas = useSelector(state => getPlayerDeltas(state, username));
  const records = useSelector(state => recordsSelectors.getPlayerRecords(state, username));
  const achievements = useSelector(state => getPlayerAchievements(state, username));
  const groupedAchievements = useSelector(state => getPlayerAchievementsGrouped(state, username));
  const competitions = useSelector(state => getPlayerCompetitions(state, username));
  const groups = useSelector(state => getPlayerGroups(state, username));
  const isLoadingDetails = useSelector(state => isFetching(state));

  const metricTypeIndex = METRIC_TYPE_OPTIONS.findIndex(o => o.value === selectedMetricType);
  const levelTypeIndex = LEVEL_TYPE_OPTIONS.findIndex(o => o.value === selectedLevelType);
  const deltasPeriodIndex = PERIOD_OPTIONS.findIndex(o => o.value === selectedPeriod);

  useEffect(() => {
    // Set the player's HiScores URL
    if (player) {
      MENU_OPTIONS.find(option => option.value === 'openOsrsHiscores').url = getOfficialHiscoresUrl(
        player
      );
    }
  }, [player]);

  const experienceChartData = useSelector(state =>
    snapshotsSelectors.getChartData(
      state,
      username,
      selectedPeriod,
      selectedMetric,
      getMeasure(selectedMetric),
      isReducedChart
    )
  );

  const rankChartData = useSelector(state =>
    snapshotsSelectors.getChartData(
      state,
      username,
      selectedPeriod,
      selectedMetric,
      'rank',
      isReducedChart
    )
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
    // Attempt to fetch player data, if it fails redirect to 404
    dispatch(fetchPlayerAction({ username }))
      .then(action => {
        if (action.error) throw new Error();
      })
      .catch(() => router.push(`/players/search/${username}`));

    dispatch(fetchAchievementsAction({ username }));
    dispatch(fetchCompetitionsAction({ username }));
    dispatch(fetchGroupsAction({ username }));
    dispatch(recordsActions.fetchPlayerRecords(username));
    dispatch(fetchDeltasAction({ username }));

    PERIOD_OPTIONS.forEach(o => {
      dispatch(snapshotsActions.fetchSnapshots(username, o.value));
    });
  };

  const getNextUrl = options => {
    const newOptions = {
      username,
      section: TABS[selectedTabIndex].toLowerCase(),
      metricType: selectedMetricType,
      metric: selectedMetric,
      period: selectedPeriod,
      ...options
    };

    const metricList = getMetricList(newOptions.metricType);
    newOptions.metric = metricList.includes(newOptions.metric) ? newOptions.metric : metricList[0];

    const query = buildQuerySearch(newOptions);
    return `/players/${newOptions.username}/${newOptions.section}/${newOptions.metricType}${query}`;
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

  const toggleReducedChart = () => {
    setIsReducedChart(val => !val);
  };

  const handleOptionSelected = async option => {
    if (option.value === 'assertType') {
      await dispatch(assertPlayerTypeAction(player.username, player.username));
    } else if (option.value === 'assertName') {
      await dispatch(assertPlayerNameAction(player.username, player.username));
    } else if (option.value === 'changeName') {
      router.push(`/names/submit/${player.displayName}`);
    }
  };

  const handleDeltasTimerEnded = () => {
    PERIOD_OPTIONS.forEach(o => {
      dispatch(snapshotsActions.fetchSnapshots(username, o.value));
    });
  };

  const onToggleReducedChart = useCallback(toggleReducedChart, []);
  const onLevelTypeSelected = useCallback(handleLevelTypeSelected, [setSelectedLevelType]);
  const onOptionSelected = useCallback(handleOptionSelected, [player]);
  const onUpdateButtonClicked = useCallback(trackPlayer, [player]);
  const onDeltasTimerEnded = useCallback(handleDeltasTimerEnded, [username]);

  useEffect(fetchAll, [dispatch, username]);

  if (!player) {
    return null;
  }

  return (
    <div className="player__container container">
      <Helmet>
        <title>{player.displayName}</title>
      </Helmet>
      <div className="player__header row">
        <div className="col">
          {player.flagged && (
            <div className="warning">
              <img src="/img/runescape/icons_small/flagged.png" alt="" />
              <span>
                This player is flagged. This is likely caused by an unregistered name change or they have
                become unranked in one or more skills due to lack of progress.
                <br />
                <Link to={`/names/submit/${player.displayName}`}>
                  Click here to submit a name change
                </Link>
                &nbsp; or join our &nbsp;
                <a href="https://wiseoldman.net/discord" target="_blank" rel="noopener noreferrer">
                  Discord server
                </a>
                &nbsp; for help.
              </span>
            </div>
          )}

          <PageHeader
            title={player.displayName}
            icon={getPlayerIcon(player.type)}
            iconTooltip={getPlayerTooltip(player.type, player.flagged)}
            badges={getPlayerBadges(player.build)}
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
      <div className="player__cards row">
        <div className="col-md-12">
          <PlayerCards player={player} />
        </div>
      </div>
      <div className="player__controls row">
        <div className="col-md-12 col-lg-7">
          <Tabs
            tabs={TABS}
            selectedIndex={selectedTabIndex}
            urlSelector={i => getNextUrl({ section: TABS[i].toLowerCase() })}
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
        {(selectedTabIndex === 4 || selectedTabIndex === 5) && (
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
        {(selectedTabIndex === 2 || selectedTabIndex === 3) && (
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
              <LineChart
                datasets={experienceChartData.datasets}
                distribution={experienceChartData.distribution}
                onDistributionChanged={onToggleReducedChart}
              />
              <LineChart
                datasets={rankChartData.datasets}
                distribution={experienceChartData.distribution}
                onDistributionChanged={onToggleReducedChart}
                invertYAxis
              />
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
          <PlayerAchievements
            groupedAchievements={groupedAchievements}
            metricType={selectedMetricType}
          />
        )}
      </div>
    </div>
  );
}

export default Player;
