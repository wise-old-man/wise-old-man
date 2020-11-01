import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, getMetricIcon } from '../../../../utils';
import './PlayerCards.scss';
import { capitalize } from 'lodash';

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
      icon: getMetricIcon(`league_${player.leagueTier}`),
      title: 'League Tier',
      text: capitalize(player.leagueTier)
    },
    {
      icon: getMetricIcon('league', true),
      title: 'League Points',
      text: formatNumber(player.leaguePoints)
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
