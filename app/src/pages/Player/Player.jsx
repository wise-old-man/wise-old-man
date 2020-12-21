import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useUrlContext } from 'hooks';
import { Loading, Tabs } from 'components';
import { ALL_METRICS } from 'config';
import { standardizeUsername, isBoss, isSkill } from 'utils';
import { playerActions, playerSelectors } from 'redux/players';
import { groupActions } from 'redux/groups';
import { competitionActions } from 'redux/competitions';
import { nameActions } from 'redux/names';
import { recordActions } from 'redux/records';
import { deltasActions } from 'redux/deltas';
import { snapshotActions } from 'redux/snapshots';
import { achievementActions } from 'redux/achievements';
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

const PERIODS = ['6h', 'day', 'week', 'month', 'year'];
const TABS = ['Overview', 'Gained', 'Competitions', 'Groups', 'Records', 'Achievements', 'Names'];

function Player() {
  const dispatch = useDispatch();
  const router = useHistory();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { username, section } = context;

  const player = useSelector(state => playerSelectors.getPlayer(state, username));
  const isTracking = useSelector(playerSelectors.isTracking);

  const selectedTabIndex = TABS.findIndex(t => t.toLowerCase() === section);

  function handleTabSelected(tabIndex) {
    updateContext({ section: TABS[tabIndex].toLowerCase() });
  }

  const handleUpdate = () => {
    dispatch(playerActions.trackPlayer(username)).then(({ payload }) => {
      if (payload.data) fetchAll(username, router, dispatch, true);
    });
  };

  const handleAssertName = () => {
    dispatch(playerActions.assertName(player.username, player.displayName));
  };

  const handleAssertType = () => {
    dispatch(playerActions.assertType(player.username, player.type));
  };

  const handleRedirect = path => {
    if (path.includes('http')) {
      window.open(path, '_blank');
    } else {
      router.push(path);
    }
  };

  const handleRefreshSnapshots = () => {
    PERIODS.forEach(period => {
      dispatch(snapshotActions.fetchSnapshots(username, period));
    });
  };

  // Fetch player details, on mount
  useEffect(() => fetchAll(username, router, dispatch), [router, dispatch, username]);

  if (!player) {
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
          {section === 'gained' && <Gained onTimerEnded={handleRefreshSnapshots} />}
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

const fetchAll = (username, router, dispatch, isReload) => {
  // Attempt to fetch player data, if it fails redirect to 404
  dispatch(playerActions.fetchPlayer(username))
    .then(action => {
      if (!action.payload.data) throw new Error();
    })
    .catch(() => router.push(`/players/search/${username}`));

  dispatch(achievementActions.fetchPlayerAchievements(username));
  dispatch(recordActions.fetchPlayerRecords(username));
  dispatch(deltasActions.fetchPlayerDeltas(username));

  PERIODS.forEach(period => {
    dispatch(snapshotActions.fetchSnapshots(username, period));
  });

  // These shouldn't be refetched when the player is updated
  if (!isReload) {
    dispatch(competitionActions.fetchPlayerCompetitions(username));
    dispatch(groupActions.fetchPlayerGroups(username));
    dispatch(nameActions.fetchPlayerNameChanges(username));
  }
};

function encodeContext({ username, section, metricType, metric, period, virtual }) {
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

  return nextURL.getPath();
}

function decodeURL(params, query) {
  const sections = TABS.map(t => t.toLowerCase());
  const metricTypes = ['skilling', 'bossing', 'activities'];

  const isValidSection = params.section && sections.includes(params.section.toLowerCase());
  const isValidMetricType = params.metricType && metricTypes.includes(params.metricType.toLowerCase());
  const isValidMetric = query.metric && ALL_METRICS.includes(query.metric.toLowerCase());
  const isValidPeriod = query.period && PERIODS.includes(query.period.toLowerCase());

  const username = standardizeUsername(params.username);
  const section = isValidSection ? params.section : 'overview';
  const virtual = query.virtual || false;
  const metric = isValidMetric ? query.metric : null;
  const period = isValidPeriod ? query.period : 'week';

  const metricType = isValidMetricType ? params.metricType : getMetricType(metric);

  return { username, section, metricType, virtual, metric, period };
}

function getMetricType(metric) {
  if (!metric || isSkill(metric) || metric === 'ehp') return 'skilling';
  if (isBoss(metric) || metric === 'ehb') return 'bossing';
  return 'activities';
}

export default Player;
