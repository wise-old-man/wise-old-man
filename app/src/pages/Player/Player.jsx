import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { METRICS, isBoss, isSkill } from '@wise-old-man/utils';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useUrlContext } from 'hooks';
import { Loading, Tabs } from 'components';
import { standardizeUsername, isValidDate } from 'utils';
import { playerActions, playerSelectors } from 'redux/players';
import { snapshotActions } from 'redux/snapshots';
import { achievementActions } from 'redux/achievements';
import { deltasActions } from 'redux/deltas';
import { recordActions } from 'redux/records';
import URL from 'utils/url';
import { PlayerContext } from './context';
import {
  Header,
  Highlights,
  Overview,
  Gained,
  Competitions,
  Groups,
  Records,
  Achievements,
  Names
} from './containers';
import './Player.scss';

const PERIODS = ['5min', 'day', 'week', 'month', 'year'];
const TABS = ['Overview', 'Gained', 'Competitions', 'Groups', 'Records', 'Achievements', 'Names'];

function Player() {
  const dispatch = useDispatch();
  const router = useHistory();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { username, section } = context;

  const player = useSelector(playerSelectors.getPlayer(username));
  const isTracking = useSelector(playerSelectors.isTracking);

  const selectedTabIndex = TABS.findIndex(t => t.toLowerCase() === section);

  const handleTabSelected = tabIndex => {
    updateContext({ section: TABS[tabIndex].toLowerCase() });
  };

  const handleUpdate = async () => {
    const { payload } = await dispatch(playerActions.trackPlayer(username));
    if (!payload.data) return;

    // Reload player details
    dispatch(playerActions.fetchPlayer(username));
    // Invalidate player deltas (so that they can be reloaded later, if needed)
    dispatch(deltasActions.invalidateDeltas(username));
    // Invalidate player snapshots (so that they can be reloaded later, if needed)
    dispatch(snapshotActions.invalidateSnapshots(username));
    // Invalidate player achievements (so that they can be reloaded later, if needed)
    dispatch(achievementActions.invalidateAchievements(username));
    // Invalidate player records (so that they can be reloaded later, if needed)
    dispatch(recordActions.invalidateRecords(username));
  };

  const handleAssertName = () => {
    dispatch(playerActions.assertName(player.username, player.displayName));
  };

  const handleAssertType = () => {
    dispatch(playerActions.assertType(player.username));
  };

  const handleRedirect = path => {
    if (path.includes('http')) {
      window.open(path, '_blank');
    } else {
      router.push(path);
    }
  };

  const fetchPlayerDetails = useCallback(() => {
    if (!player || player.latestSnapshot === undefined) {
      // Load player details, if not fully loaded yet
      dispatch(playerActions.fetchPlayer(username)).then(action => {
        // Player not found, redirect to search
        if (!action.payload.data) router.push(`/players/search/${username}`);
      });
    }
  }, [dispatch, router, username, player]);

  useEffect(fetchPlayerDetails, [fetchPlayerDetails]);

  if (!player || player.latestSnapshot === undefined) {
    return <Loading />;
  }

  return (
    <PlayerContext.Provider value={{ context, updateContext }}>
      <div className="player__container container">
        <Helmet>
          <title>{player.displayName}</title>
        </Helmet>
        <div className="player__header row">
          <div className="col">
            <Header
              player={player}
              isTracking={isTracking}
              handleRedirect={handleRedirect}
              handleUpdate={handleUpdate}
              handleAssertName={handleAssertName}
              handleAssertType={handleAssertType}
            />
          </div>
        </div>
        <div className="player__cards row">
          <div className="col-md-12">
            <Highlights player={player} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Tabs
              tabs={TABS}
              selectedIndex={selectedTabIndex}
              align="space-between"
              onTabSelected={handleTabSelected}
            />
          </div>
        </div>
        <div className="player__content row">
          {section === 'overview' && <Overview />}
          {section === 'gained' && <Gained />}
          {section === 'competitions' && <Competitions />}
          {section === 'groups' && <Groups />}
          {section === 'records' && <Records />}
          {section === 'achievements' && <Achievements />}
          {section === 'names' && <Names />}
        </div>
      </div>
    </PlayerContext.Provider>
  );
}

function encodeContext({ username, section, metricType, metric, period, virtual, startDate, endDate }) {
  const nextURL = new URL(`/players/${username}`);

  nextURL.appendToPath(`/${section || 'overview'}`);

  if (metricType && section !== 'competitions' && section !== 'groups' && section !== 'names') {
    nextURL.appendToPath(`/${metricType}`);
  }

  if (metric && section && section === 'gained') {
    nextURL.appendSearchParam('metric', metric);
  }

  if (virtual && (!section || section === 'overview')) {
    nextURL.appendSearchParam('virtual', true);
  }

  if (period && period !== 'week' && section && section === 'gained') {
    nextURL.appendSearchParam('period', period);
  }

  const periodUrlParam = nextURL.getSearchParam('period');

  if (
    periodUrlParam &&
    periodUrlParam.value === 'custom' &&
    startDate &&
    endDate &&
    isValidDate(startDate) &&
    isValidDate(endDate)
  ) {
    nextURL.appendSearchParam('startDate', startDate.toISOString());
    nextURL.appendSearchParam('endDate', endDate.toISOString());
  }

  return nextURL.getPath();
}

function decodeURL(params, query) {
  const sections = TABS.map(t => t.toLowerCase());
  const metricTypes = ['skilling', 'bossing', 'activities'];

  // TODO: quick dirty fix, needs to take more aliases into account
  // whenever we have the WOM utils package properly configured
  let queryMetric = query.metric;
  if (queryMetric === 'runecraft') queryMetric = 'runecrafting';

  const isValidSection = params.section && sections.includes(params.section.toLowerCase());
  const isValidMetricType = params.metricType && metricTypes.includes(params.metricType.toLowerCase());
  const isValidMetric = queryMetric && METRICS.includes(queryMetric.toLowerCase());
  const isValidPeriod = query.period && PERIODS.includes(query.period.toLowerCase());

  const isValidStartDate = query.startDate && !isValidPeriod && isValidDate(query.startDate);
  const isValidEndDate = query.endDate && !isValidPeriod && isValidDate(query.endDate);

  const username = standardizeUsername(params.username);
  const section = isValidSection ? params.section : 'overview';
  const virtual = query.virtual || false;
  const metric = isValidMetric ? queryMetric : null;
  const period = isValidPeriod || query.period === 'custom' ? query.period : 'week';
  const startDate = isValidStartDate ? new Date(query.startDate) : null;
  const endDate = isValidEndDate ? new Date(query.endDate) : null;

  const metricType = isValidMetricType ? params.metricType : getMetricType(metric);

  return { username, section, metricType, virtual, metric, period, startDate, endDate };
}

function getMetricType(metric) {
  if (!metric || isSkill(metric) || metric === 'ehp') return 'skilling';
  if (isBoss(metric) || metric === 'ehb') return 'bossing';
  return 'activities';
}

export default Player;
