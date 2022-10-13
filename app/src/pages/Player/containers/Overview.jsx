import React, { useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { METRICS, SKILLS, BOSSES, ACTIVITIES, PlayerBuildProps } from '@wise-old-man/utils';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  formatDate,
  capitalize,
  getMetricIcon,
  durationBetween,
  getExperienceAt,
  formatNumber
} from 'utils';
import { InfoPanel, CardList, Selector } from 'components';
import { playerSelectors } from 'redux/players';
import { competitionSelectors, competitionActions } from 'redux/competitions';
import { achievementSelectors, achievementActions } from 'redux/achievements';
import { PlayerStatsTable } from '../components';
import { PlayerContext } from '../context';

const LEVEL_TYPE_OPTIONS = [
  { label: 'Show Regular Levels', value: 'regular' },
  { label: 'Show Virtual Levels', value: 'virtual' }
];

const METRIC_TYPE_OPTIONS = [
  { label: 'Skilling', value: 'skilling' },
  { label: 'Bossing', value: 'bossing' },
  { label: 'Activities', value: 'activities' }
];

function Overview() {
  const dispatch = useDispatch();
  const { context, updateContext } = useContext(PlayerContext);
  const { username, virtual, metricType } = context;

  const levelTypeIndex = virtual ? 1 : 0;
  const metricTypeIndex = METRIC_TYPE_OPTIONS.findIndex(o => o.value === metricType);

  const player = useSelector(playerSelectors.getPlayer(username));
  const competitions = useSelector(competitionSelectors.getPlayerCompetitions(username));
  const achievements = useSelector(achievementSelectors.getPlayerAchievements(username));

  const handleMetricTypeSelected = e => {
    if (e.value === 'skilling') {
      updateContext({ metricType: e.value, metric: SKILLS[0] });
    } else if (e.value === 'bossing') {
      updateContext({ metricType: e.value, metric: BOSSES[0] });
    } else if (e.value === 'activities') {
      updateContext({ metricType: e.value, metric: ACTIVITIES[0] });
    }
  };

  const handleLevelTypeSelected = e => {
    updateContext({ virtual: e.value === 'virtual' });
  };

  const fetchAchievements = useCallback(() => {
    // Fetch player achievements, if not loaded yet
    if (!achievements) {
      dispatch(achievementActions.fetchPlayerAchievements(username));
    }
  }, [dispatch, username, achievements]);

  const fetchCompetitions = useCallback(() => {
    // Fetch player competitions, if not loaded yet
    if (!competitions) {
      dispatch(competitionActions.fetchPlayerCompetitions(username));
    }
  }, [dispatch, username, competitions]);

  useEffect(fetchAchievements, [fetchAchievements]);
  useEffect(fetchCompetitions, [fetchCompetitions]);

  if (!player) return null;

  return (
    <>
      <div className="col-lg-3 col-md-7">
        <span className="panel-label">Player details</span>
        <Info player={player} />
      </div>
      <div className="col-lg-3 col-md-5">
        {competitions && <Competitions player={player} competitions={competitions} />}
        {achievements && <RecentAchievements player={player} achievements={achievements} />}
        {player.latestSnapshot && <ClosestSkills player={player} />}
      </div>
      <div className="col-lg-6 col-md-12">
        <span className="panel-label">Current stats</span>
        <div className="row overview-controls">
          <div className="col-lg-6 col-md-6 col-sm-12">
            <Selector
              options={METRIC_TYPE_OPTIONS}
              selectedIndex={metricTypeIndex}
              onSelect={handleMetricTypeSelected}
            />
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12">
            <Selector
              options={LEVEL_TYPE_OPTIONS}
              selectedIndex={levelTypeIndex}
              onSelect={handleLevelTypeSelected}
              disabled={metricType !== 'skilling'}
            />
          </div>
        </div>
        <PlayerStatsTable player={player} showVirtualLevels={virtual} metricType={metricType} />
      </div>
    </>
  );
}

function ClosestSkills({ player }) {
  const expAt99 = getExperienceAt(99);
  const expLeftTo99 = skill => expAt99 - player.latestSnapshot.data.skills[skill].experience;

  const diffs = SKILLS.filter(s => s !== 'overall')
    .map(s => ({ skill: s, expLeft: Math.max(0, expLeftTo99(s)) }))
    .filter(s => s.expLeft > 0)
    .sort((a, b) => a.expLeft - b.expLeft)
    .slice(0, 5);

  if (diffs.length === 0) {
    return null;
  }

  const diffItems = diffs.map(d => ({
    icon: getMetricIcon(d.skill),
    title: `99 ${capitalize(d.skill)}`,
    subtitle: `${formatNumber(d.expLeft)} exp left`
  }));

  return (
    <>
      <span className="panel-label">Nearest 99s</span>
      <CardList items={diffItems} />
    </>
  );
}

function RecentAchievements({ player, achievements }) {
  if (!achievements || achievements.length === 0) return null;

  const achievementItems = achievements
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3)
    .map(a => ({
      icon: getAchievementIcon(a.metric),
      title: a.name,
      subtitle: a.unknownDate ? 'Unknown date' : formatDate(a.createdAt, 'DD MMM, YYYY')
    }));

  return (
    <>
      <div className="panel-header">
        <span className="panel-label">Recent achievements</span>
        <Link to={`/players/${player.displayName}/achievements`} className="panel-label-link">
          Show more
        </Link>
      </div>
      <CardList items={achievementItems} />
    </>
  );
}

function Competitions({ player, competitions }) {
  if (competitions.length === 0) return null;

  const now = Date.now();

  const ongoing = competitions
    .filter(c => c.competition.startsAt < now && c.competition.endsAt > now)
    .slice(0, 3)
    .map(c => ({
      id: c.competition.id,
      title: c.competition.title,
      icon: getMetricIcon(c.competition.metric),
      subtitle: `Ends in ${durationBetween(new Date(), c.competition.endsAt, 2, true)}`
    }));

  const upcoming = competitions
    .filter(c => c.competition.startsAt > now)
    .slice(0, 3)
    .map(c => ({
      id: c.competition.id,
      title: c.competition.title,
      icon: getMetricIcon(c.competition.metric),
      subtitle: `Starts in ${durationBetween(new Date(), c.competition.startsAt, 2, true)}`
    }));

  return (
    <>
      {ongoing && ongoing.length > 0 && (
        <>
          <div className="panel-header">
            <span className="panel-label">Ongoing competitions</span>
            <Link to={`/players/${player.displayName}/competitions`} className="panel-label-link">
              Show more
            </Link>
          </div>
          <CardList items={ongoing} urlSelector={item => `/competitions/${item.id}`} />
        </>
      )}
      {upcoming && upcoming.length > 0 && (
        <>
          <div className="panel-header">
            <span className="panel-label">Upcoming competitions</span>
            <Link to={`/players/${player.displayName}/competitions`} className="panel-label-link">
              Show more
            </Link>
          </div>
          <CardList items={upcoming} urlSelector={item => `/competitions/${item.id}`} />
        </>
      )}
    </>
  );
}

function Info({ player }) {
  const { id, type, build, registeredAt, updatedAt, lastChangedAt } = player;
  const lastChangedDate = lastChangedAt ? formatDate(lastChangedAt, 'DD MMM YYYY, HH:mm') : 'Unknown';

  const data = [
    { key: 'Id', value: id },
    { key: 'Type', value: capitalize(type) },
    { key: 'Build', value: PlayerBuildProps[build].name },
    { key: 'Last updated at', value: formatDate(updatedAt, 'DD MMM YYYY, HH:mm') },
    { key: 'Last changed at', value: lastChangedDate },
    { key: 'Registered at', value: formatDate(registeredAt, 'DD MMM YYYY, HH:mm') }
  ];

  return <InfoPanel data={data} />;
}

function getAchievementIcon(metric) {
  if (METRICS.includes(metric)) {
    return getMetricIcon(metric);
  }

  return getMetricIcon('combat');
}

ClosestSkills.propTypes = {
  player: PropTypes.shape({
    latestSnapshot: PropTypes.shape()
  }).isRequired
};

RecentAchievements.propTypes = {
  player: PropTypes.shape({
    displayName: PropTypes.string
  }).isRequired,
  achievements: PropTypes.arrayOf(PropTypes.shape({})).isRequired
};

Competitions.propTypes = {
  player: PropTypes.shape({
    displayName: PropTypes.string
  }).isRequired,
  competitions: PropTypes.arrayOf(PropTypes.shape({})).isRequired
};

Info.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string,
    build: PropTypes.string,
    registeredAt: PropTypes.instanceOf(Date),
    updatedAt: PropTypes.instanceOf(Date),
    lastChangedAt: PropTypes.instanceOf(Date)
  }).isRequired
};

export default Overview;
