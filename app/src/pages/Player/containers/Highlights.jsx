import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, getMetricIcon } from 'utils';

function Highlights({ player }) {
  const cards = getHighlights(player);

  return (
    <div className="player-highlights__container">
      {cards.map(c => (
        <div key={c.title} className="player-highlight">
          <div key={c.title} className="player-highlight__wrapper">
            <img className="player-highlight__icon" src={c.icon} alt="" />
            <div className="player-highlight__content">
              <div className="player-highlight__title">{c.title}</div>
              <div className="player-highlight__text">{c.text}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getHighlights(player) {
  if (!player || !player.combatLevel || !player.latestSnapshot) {
    return [];
  }

  const expRank = player.latestSnapshot.overall.rank;
  const ehpRank = player.latestSnapshot.ehp.rank;
  const ehbRank = player.latestSnapshot.ehb.rank;

  return [
    {
      icon: getMetricIcon('combat'),
      title: `Combat Lvl.`,
      text: player.combatLevel
    },
    {
      icon: getMetricIcon('overall'),
      title: player.exp === -1 ? `Unranked` : `${formatNumber(player.exp, true)} Exp.`,
      text: expRank === -1 ? `---` : `Rank ${formatNumber(expRank)}`
    },
    {
      icon: getMetricIcon('ehp'),
      title: `${formatNumber(player.ehp)} EHP`,
      text: `Rank ${formatNumber(ehpRank)}`
    },
    {
      icon: getMetricIcon('ehb'),
      title: `${formatNumber(player.ehb)} EHB`,
      text: `Rank ${formatNumber(ehbRank)}`
    },
    {
      icon: getMetricIcon('ttm'),
      title: 'Time to Max',
      text: `${formatNumber(player.ttm)} hours`
    },
    {
      icon: getMetricIcon('tt200m'),
      title: 'Time to 200m all',
      text: `${formatNumber(player.tt200m)} hours`
    }
  ];
}

Highlights.propTypes = {
  player: PropTypes.shape({
    latestSnapshot: PropTypes.shape(),
    combatLevel: PropTypes.number,
    exp: PropTypes.number,
    ehp: PropTypes.number,
    ehb: PropTypes.number,
    ttm: PropTypes.number,
    tt200m: PropTypes.number
  }).isRequired
};

export default Highlights;
