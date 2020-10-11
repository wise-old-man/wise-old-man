import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, getMetricIcon } from '../../../../utils';
import './PlayerCards.scss';

function getCards(player) {
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
      title: `${formatNumber(player.exp, true)} Exp.`,
      text: `Rank ${formatNumber(expRank)}`
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

function PlayerCards({ player }) {
  const cards = getCards(player);

  return (
    <div className="player-cards__container">
      {cards.map(c => (
        <div key={c.title} className="player-card">
          <div key={c.title} className="player-card__wrapper">
            <img className="player-card__icon" src={c.icon} alt="" />
            <div className="player-card__content">
              <div className="player-card__title">{c.title}</div>
              <div className="player-card__text">{c.text}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

PlayerCards.defaultProps = {
  player: undefined
};

PlayerCards.propTypes = {
  player: PropTypes.shape()
};

export default PlayerCards;
