import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import CardList from '../../../../components/CardList';
import {
  durationBetween,
  formatDate,
  getSkillIcon,
  capitalize,
  formatNumber,
  getExperienceAt
} from '../../../../utils';
import { SKILLS } from '../../../../config';
import './PlayerHighlights.scss';

function getAchievementIcon(type) {
  for (let i = 0; i < SKILLS.length; i += 1) {
    if (type.includes(SKILLS[i])) {
      return getSkillIcon(SKILLS[i]);
    }
  }

  if (type === 'Maxed combat') {
    return getSkillIcon('combat');
  }

  return getSkillIcon('overall');
}

function renderOngoingCompetitions(competitions) {
  if (!competitions) {
    return null;
  }

  const ongoingCompetitions = competitions.filter(c => c.status === 'ongoing').slice(0, 3);

  if (ongoingCompetitions.length === 0) {
    return null;
  }

  const ongoingItems = ongoingCompetitions.map(c => ({
    icon: getSkillIcon(c.metric),
    title: c.title,
    subtitle: `Ends in ${durationBetween(new Date(), c.endsAt, 2, true)}`
  }));

  return (
    <div className="player-highlight">
      <span className="panel-label">Ongoing competitions</span>
      <CardList items={ongoingItems} />
    </div>
  );
}

function renderUpcomingCompetitions(competitions) {
  if (!competitions) {
    return null;
  }

  const upcomingCompetitions = competitions.filter(c => c.status === 'upcoming').slice(0, 3);

  if (upcomingCompetitions.length === 0) {
    return null;
  }

  const upcomingItems = upcomingCompetitions.map(c => ({
    icon: getSkillIcon(c.metric),
    title: c.title,
    subtitle: `Starts in ${durationBetween(new Date(), c.startsAt, 2, true)}`
  }));

  return (
    <div className="player-highlight">
      <span className="panel-label">Upcoming competitions</span>
      <CardList items={upcomingItems} />
    </div>
  );
}

function renderRecentAchievements(achievements) {
  if (!achievements) {
    return null;
  }

  const completedAchievements = achievements
    .filter(a => a.createdAt !== null)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  if (completedAchievements.length === 0) {
    return null;
  }

  const achievementItems = completedAchievements.map(a => ({
    icon: getAchievementIcon(a.type),
    title: a.type,
    subtitle: a.unknownDate ? 'Unknown date' : formatDate(a.createdAt, 'DD MMM, YYYY')
  }));

  return (
    <div className="player-highlight">
      <span className="panel-label">Most recent achievements</span>
      <CardList items={achievementItems} />
    </div>
  );
}

function renderClosestSkills(player) {
  if (!player || !player.latestSnapshot) {
    return null;
  }

  const expAt99 = getExperienceAt(99);
  const expLeftTo99 = skill => expAt99 - player.latestSnapshot[skill].experience;

  const diffs = SKILLS.filter(s => s !== 'overall')
    .map(s => ({ skill: s, expLeft: Math.max(0, expLeftTo99(s)) }))
    .filter(s => s.expLeft > 0)
    .sort((a, b) => a.expLeft - b.expLeft)
    .slice(0, 5);

  if (diffs.length === 0) {
    return null;
  }

  const diffItems = diffs.map(d => ({
    icon: getSkillIcon(d.skill),
    title: `99 ${capitalize(d.skill)}`,
    subtitle: `${formatNumber(d.expLeft)} exp left`
  }));

  return (
    <div className="player-highlight">
      <span className="panel-label">Nearest 99s</span>
      <CardList items={diffItems} />
    </div>
  );
}

function PlayerHighlights({ player, competitions, achievements }) {
  const ongoing = useMemo(() => renderOngoingCompetitions(competitions), [competitions]);
  const upcoming = useMemo(() => renderUpcomingCompetitions(competitions), [competitions]);
  const recentAchievements = useMemo(() => renderRecentAchievements(achievements), [achievements]);
  const closestSkills = useMemo(() => renderClosestSkills(player), [player]);

  return (
    <div className="player-highlights__container">
      {ongoing}
      {upcoming}
      {recentAchievements}
      {closestSkills}
    </div>
  );
}

PlayerHighlights.propTypes = {
  player: PropTypes.shape().isRequired,
  competitions: PropTypes.arrayOf(PropTypes.shape).isRequired,
  achievements: PropTypes.arrayOf(PropTypes.shape).isRequired
};

export default PlayerHighlights;
