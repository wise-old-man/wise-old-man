import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { playerActions, playerSelectors } from 'redux/players';
import Button from '../../components/Button';
import Table from '../../components/Table';
import PlayerTag from '../../components/PlayerTag';
import { durationBetween } from '../../utils';
import './PlayerSearch.scss';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'displayName',
      className: () => '-primary',
      transform: (value, row) => (
        <Link to={`/players/${row.username}`}>
          <PlayerTag name={value} type={row.type} flagged={row.flagged} />
        </Link>
      )
    },
    {
      key: 'updatedAt',
      transform: value => `Last updated ${durationBetween(value, new Date(), 2, true)} ago`
    }
  ]
};

function PlayerSearch() {
  const router = useHistory();
  const dispatch = useDispatch();
  const { username } = useParams();

  const [isTracking, setIsTracking] = useState(false);
  const searchResults = useSelector(playerSelectors.getSearchResults);

  const searchPlayers = () => {
    dispatch(playerActions.searchPlayers(username));
  };

  const trackPlayer = async () => {
    try {
      setIsTracking(true);
      const { payload } = await dispatch(playerActions.trackPlayer(username));

      if (payload.data) {
        router.push(`/players/${payload.data.username}`);
      }
    } finally {
      setIsTracking(false);
    }
  };

  const onButtonClicked = useCallback(trackPlayer, [username]);

  useEffect(searchPlayers, [username]);

  return (
    <div className="player-search__container container">
      <Helmet>
        <title>{`Player search: ${username}`}</title>
      </Helmet>
      <div className="player-search__header row">
        <div className="col">
          <h1 className="header__title">{`Couldn't find "${username}"`}</h1>
          <p className="header__text">
            This player is not being tracked yet, would you like to start tracking it?
          </p>
          <Button text={`Track ${username}`} onClick={onButtonClicked} loading={isTracking} />
        </div>
      </div>
      {searchResults && searchResults.length > 0 && (
        <div className="player-search__list row">
          <div className="col">
            <b>{`Search results for "${username}":`}</b>
            <Table
              uniqueKeySelector={TABLE_CONFIG.uniqueKey}
              columns={TABLE_CONFIG.columns}
              rows={searchResults}
              listStyle
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerSearch;
